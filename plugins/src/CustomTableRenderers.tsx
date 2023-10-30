import React from 'react';
import { PivotData } from "react-pivottable/Utilities";

let translate = (key: string, parameters?: {
  [key: string]: any}) => key;

export function setTranslationFunction(newTranslateFunc: any){
  translate = newTranslateFunc;
}


// helper function for setting row/col-span in pivotTableRenderer
const spanSize = function(arr: any, i: number, j: number) {
  let x;
  if (i !== 0) {
    let asc, end;
    let noDraw = true;
    for (
      x = 0, end = j, asc = end >= 0;
      asc ? x <= end : x >= end;
      asc ? x++ : x--
    ) {
      if (arr[i - 1][x] !== arr[i][x]) {
        noDraw = false;
      }
    }
    if (noDraw) {
      return -1;
    }
  }
  let len = 0;
  while (i + len < arr.length) {
    let asc1, end1;
    let stop = false;
    for (
      x = 0, end1 = j, asc1 = end1 >= 0;
      asc1 ? x <= end1 : x >= end1;
      asc1 ? x++ : x--
    ) {
      if (arr[i][x] !== arr[i + len][x]) {
        stop = true;
      }
    }
    if (stop) {
      break;
    }
    len++;
  }
  return len;
};

export class TableRenderer extends React.PureComponent<{
  tableColorScaleGenerator: any;
  tableOptions: any;
  vals: any[];
  aggregatorName: string;
}> {
  opts ={} as any;

  getTotalsLabel(){
    if(this.props.vals !== null && this.props.vals.length > 0 ){
      return this.props.aggregatorName + " - " + this.props.vals[0]
    }
    return translate("Totals")
  }

  render() {
    const pivotData = new PivotData(this.props) as any;
    const colAttrs = pivotData.props.cols;
    const rowAttrs = pivotData.props.rows;
    const rowKeys = pivotData.getRowKeys();
    const colKeys = pivotData.getColKeys();
    const grandTotalAggregator = pivotData.getAggregator([], []);
    const totalsLabel = this.getTotalsLabel();

    let valueCellColors = (() => {}) as any;
    let rowTotalColors =  (() => {}) as any;
    let colTotalColors = (() => {}) as any;
    if (this.opts.heatmapMode) {
      const colorScaleGenerator = this.props.tableColorScaleGenerator;
      const rowTotalValues = colKeys.map((x: any) =>
        pivotData.getAggregator([], x).value()
      );
      rowTotalColors = colorScaleGenerator(rowTotalValues);
      const colTotalValues = rowKeys.map((x: any) =>
        pivotData.getAggregator(x, []).value()
      );
      colTotalColors = colorScaleGenerator(colTotalValues);

      if (this.opts.heatmapMode === 'full') {
        const allValues: any = [];
        rowKeys.map((r: any) =>
          colKeys.map((c: any) =>
            allValues.push(pivotData.getAggregator(r, c).value())
          )
        );
        const colorScale = colorScaleGenerator(allValues);
        valueCellColors = (r: any, c: any, v: any) => colorScale(v);
      } else if (this.opts.heatmapMode === 'row') {
        const rowColorScales = {};
        rowKeys.map((r: any) => {
          const rowValues = colKeys.map((x: any) =>
            pivotData.getAggregator(r, x).value()
          );
          // @ts-ignore
          rowColorScales[r] = colorScaleGenerator(rowValues);
        });
        // @ts-ignore
        valueCellColors = (r: any, c: any, v: any)  => rowColorScales[r](v);
      } else if (this.opts.heatmapMode === 'col') {
        const colColorScales = {};
        colKeys.map((c: any) => {
          const colValues = rowKeys.map((x: any) =>
            pivotData.getAggregator(x, c).value()
          );
          // @ts-ignore
          colColorScales[c] = colorScaleGenerator(colValues);
        });
        // @ts-ignore
        valueCellColors = (r: any, c: any, v: any)  => colColorScales[c](v);
      }
    }

    const getClickHandler =
      this.props.tableOptions && this.props.tableOptions.clickCallback
        ? (value: any, rowValues: any, colValues: any) => {
          const filters = {};
          for (const i of Object.keys(colAttrs || {})) {
            const attr = colAttrs[i];
            if (colValues[i] !== null) {
              // @ts-ignore
              filters[attr] = colValues[i];
            }
          }
          for (const i of Object.keys(rowAttrs || {})) {
            const attr = rowAttrs[i];
            if (rowValues[i] !== null) {
              // @ts-ignore
              filters[attr] = rowValues[i];
            }
          }
          return (e: any) =>
            this.props.tableOptions.clickCallback(
              e,
              value,
              filters,
              pivotData
            );
        }
        : null;
    return (
      <table className="pvtTable">
        <thead>
        {colAttrs.map(function(c: any, j: any) {
          return (
            <tr key={`colAttr${j}`}>
              {j === 0 && rowAttrs.length !== 0 && (
                <th colSpan={rowAttrs.length} rowSpan={colAttrs.length} />
              )}
              <th className="pvtAxisLabel">{c}</th>
              {colKeys.map(function(colKey: any, i: any) {
                const x = spanSize(colKeys, i, j);
                if (x === -1) {
                  return null;
                }
                return (
                  <th
                    className="pvtColLabel"
                    key={`colKey${i}`}
                    colSpan={x}
                    rowSpan={
                      j === colAttrs.length - 1 && rowAttrs.length !== 0
                        ? 2
                        : 1
                    }
                  >
                    {colKey[j]}
                  </th>
                );
              })}

              {j === 0 && (
                <th
                  className="pvtTotalLabel"
                  rowSpan={
                    colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)
                  }
                >
                  {totalsLabel}
                </th>
              )}
            </tr>
          );
        })}

        {rowAttrs.length !== 0 && (
          <tr>
            {rowAttrs.map(function(r: any, i: any) {
              return (
                <th className="pvtAxisLabel" key={`rowAttr${i}`}>
                  {r}
                </th>
              );
            })}
            <th className="pvtTotalLabel">
              {colAttrs.length === 0 ? totalsLabel : null}
            </th>
          </tr>
        )}
        </thead>

        <tbody>
        {rowKeys.map(function(rowKey: any, i: any) {
          const totalAggregator = pivotData.getAggregator(rowKey, []) as any;
          return (
            <tr key={`rowKeyRow${i}`}>
              {rowKey.map(function(txt: any, j: any) {
                const x = spanSize(rowKeys, i, j);
                if (x === -1) {
                  return null;
                }
                return (
                  <th
                    key={`rowKeyLabel${i}-${j}`}
                    className="pvtRowLabel"
                    rowSpan={x}
                    colSpan={
                      j === rowAttrs.length - 1 && colAttrs.length !== 0
                        ? 2
                        : 1
                    }
                  >
                    {txt}
                  </th>
                );
              })}
              {colKeys.map(function(colKey: any, j: any) {
                const aggregator = pivotData.getAggregator(rowKey, colKey);
                return (
                  <td
                    className="pvtVal"
                    key={`pvtVal${i}-${j}`}
                    onClick={() =>
                      getClickHandler &&
                      getClickHandler(aggregator.value(), rowKey, colKey)
                    }
                    style={valueCellColors(
                      rowKey,
                      colKey,
                      aggregator.value()
                    )}
                  >
                    {aggregator.format(aggregator.value())}
                  </td>
                );
              })}
              <td
                className="pvtTotal"
                onClick={() =>
                  getClickHandler &&
                  getClickHandler(totalAggregator.value(), rowKey, [null])
                }
                style={colTotalColors(totalAggregator.value())}
              >
                {totalAggregator.format(totalAggregator.value())}
              </td>
            </tr>
          );
        })}

        <tr>
          <th
            className="pvtTotalLabel"
            colSpan={rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)}
          >
            {translate("Totals")}
          </th>

          {colKeys.map(function(colKey: any, i: any) {
            const totalAggregator = pivotData.getAggregator([], colKey) as any;
            return (
              <td
                className="pvtTotal"
                key={`total${i}`}
                onClick={() =>
                  getClickHandler &&
                  getClickHandler(totalAggregator.value(), [null], colKey)
                }
                style={rowTotalColors(totalAggregator.value())}
              >
                {totalAggregator.format(totalAggregator.value())}
              </td>
            );
          })}

          <td
            onClick={()=>
              getClickHandler &&
              getClickHandler(grandTotalAggregator.value(), [null], [null])
            }
            className="pvtGrandTotal"
          >
            {grandTotalAggregator.format(grandTotalAggregator.value())}
          </td>
        </tr>
        </tbody>
      </table>
    );
  }
}

export class TableRendererFull extends TableRenderer{
  constructor(props: any){
    super(props);
    this.opts = {heatmapMode: 'full'};
  }
}

export class TableRendererCol extends TableRenderer{
  constructor(props: any){
    super(props);
    this.opts = {heatmapMode: 'col'};
  }
}

export class TableRendererRow extends TableRenderer{
  constructor(props: any){
    super(props);
    this.opts = {heatmapMode: 'row'};
  }
}


class TSVExportRenderer extends React.PureComponent<{
  aggregatorName: any
}> {
  render() {
    const pivotData = new PivotData(this.props) as any;
    const rowKeys = pivotData.getRowKeys();
    const colKeys = pivotData.getColKeys();
    if (rowKeys.length === 0) {
      rowKeys.push([]);
    }
    if (colKeys.length === 0) {
      colKeys.push([]);
    }

    const headerRow = pivotData.props.rows.map((r: any) => r);
    if (colKeys.length === 1 && colKeys[0].length === 0) {
      headerRow.push(this.props.aggregatorName);
    } else {
      colKeys.map((c: any) => headerRow.push(c.join('-')));
    }

    const result = rowKeys.map((r: any) => {
      const row = r.map((x: any) => x);
      colKeys.map((c: any) => {
        const v = pivotData.getAggregator(r, c).value();
        row.push(v ? v : '');
      });
      return row;
    });

    result.unshift(headerRow);

    return (
      <textarea
        value={result.map((r: any) => r.join('\t')).join('\n')}
        style={{width: window.innerWidth / 2, height: window.innerHeight / 2}}
        readOnly={true}
      />
    );
  }
}

// TSVExportRenderer.defaultProps = PivotData.defaultProps;
// TSVExportRenderer.propTypes = PivotData.propTypes;


export default {
  Table: TableRenderer,
  'Table Heatmap': TableRendererFull,
  'Table Col Heatmap': TableRendererCol,
  'Table Row Heatmap': TableRendererRow,
  'Exportable TSV': TSVExportRenderer,
};