/*
Copyright 2005 - 2021 Advantage Solutions, s. r. o.

This file is part of ORIGAM (http://www.origam.org).

ORIGAM is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

ORIGAM is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with ORIGAM. If not, see <http://www.gnu.org/licenses/>.
*/


import { action, observable, toJS } from "mobx";
import React from "react";
import PivotTableUI from 'react-pivottable/PivotTableUI';
import PivotTable from 'react-pivottable/PivotTable';
import 'react-pivottable/pivottable.css';
import {
  ILocalization,
  ILocalizer,
  IPluginData,
  IPluginDataView,
  IPluginProperty,
  IPluginTableRow,
  ISectionPlugin
} from "@origam/plugin-interfaces";
import { observer } from "mobx-react";
import S from "./PivotTablePlugin.module.scss"
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import { Button } from "@origam/components";
import { IListViewItem, SimpleListView } from "./SimpleListView";
import { v4 as uuidv4 } from 'uuid';

const PlotlyRenderers = createPlotlyRenderers(Plot);


export class PivotTablePlugin implements ISectionPlugin {
  $type_ISectionPlugin: 1 = 1;
  id: string = ""

  @observable
  tableState = [];

  initialize(xmlAttributes: { [key: string]: string }): void {

  }

  @action
  onTableChange(tableState: any) {
    console.log(tableState);
    this.tableState = tableState;
  }

  getPropertyValues(dataView: IPluginDataView, row: IPluginTableRow, properties: IPluginProperty[]) {
    return dataView.properties.map(prop => dataView.getCellText(row, prop.id));
  }

  getComponent(data: IPluginData, createLocalizer: (localizations: ILocalization[]) => ILocalizer): JSX.Element {

    let dataView = data.dataView;
    const tableData = [dataView.properties.map(prop => prop.name)];
    for (const row of dataView.tableRows) {
      const values = this.getPropertyValues(dataView, row, dataView.properties);
      tableData.push(values);
    }
    return <PivotTableComponent data={tableData} dataView={data.dataView}/>
  }

  getScreenParameters: (() => { [parameter: string]: string }) | undefined;
}

@observer
export class PivotTableComponent extends React.Component<{
  data: string[][],
  dataView: IPluginDataView
}> {
  readonly tableViewNameTemplate = "New Table View";

  @observable
  views: TableView[] = [];

  @observable
  currentView: TableView;

  @observable
  showEditMode = false;

  constructor(props: any) {
    super(props);
    const config = this.getPersistedConfig();
    if (!config) {
      this.currentView = this.createTableView();
    } else {
      this.views = config.map(viewConfig => new TableView(viewConfig.name, uuidv4(), viewConfig.tableState));
      this.currentView = this.views[0];
    }
  }

  getPersistedConfig() {
    const configStr = (this.props.dataView as any).getConfiguration("PivotTablePlugin");
    if (!configStr) {
      return undefined;
    }
    const config = JSON.parse(configStr) as IPersistAbleState[];
    return config.length === 0
      ? undefined
      : config;
  }

  createTableView() {
    let newName = this.tableViewNameTemplate;
    for (let i = 0; i < 1000; i++) {
      if (this.views.map(view => view.name).includes(newName)) {
        newName = `${this.tableViewNameTemplate} (${i})`;
      } else {
        let tableView = new TableView(newName, uuidv4(), {});
        this.views.push(tableView);
        return tableView;
      }
    }
    throw new Error("Could not create new TableView")
  }

  deleteCurrentTableView() {
    let newViewIndex = this.views.indexOf(this.currentView);

    this.deleteTableView(this.currentView);

    if (newViewIndex > this.views.length - 1) {
      newViewIndex = this.views.length - 1;
    }
    if (newViewIndex < 0) {
      this.currentView = this.createTableView();
    } else {
      this.currentView = this.views[newViewIndex];
    }
    this.showEditMode = false
    this.onSave();
  }

  deleteTableView(tableView: TableView) {
    const index = this.views.indexOf(tableView);
    if (index > -1) {
      this.views.splice(index, 1);
    }
  }

  newTableView() {
    this.currentView = this.createTableView();
    this.onSave();
  }

  @action
  onTableChange(tableState: any) {
    console.log(tableState);
    this.currentView.tableState = tableState;
  }

  onSave() {
    this.currentView.updatePersistedState();
    let json = JSON.stringify(this.views.map(view => view.persistedState));
    (this.props.dataView as any).saveConfiguration("PivotTablePlugin", json);
    this.showEditMode = false;
  }

  onCancel() {
    this.showEditMode = false;
  }

  onEdit() {
    this.showEditMode = true;
  }

  renderEditMode() {
    return <div className={S.tableContainer}>
      <div className={S.topToolbar}>
        <div>{"View Name:"}</div>
        <input
          value={this.currentView.name}
          onChange={event => this.currentView.name = event.target.value}/>
        <Button
          className={S.button}
          label={"Save"}
          onClick={() => this.onSave()}/>
        <Button
          className={S.button}
          label={"Cancel"}
          onClick={() => this.onCancel()}/>
        <Button
          className={S.button}
          label={this.views.length === 1 && this.currentView.name === this.tableViewNameTemplate ? "Clear" : "Delete"}
          onClick={() => this.deleteCurrentTableView()}/>
      </div>
      <PivotTableUI
        data={this.props.data}
        onChange={tableState => this.onTableChange(tableState)}
        renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
        {...this.currentView.tableState}
      />
    </div>
  }

  renderDisplayMode() {
    return <div className={S.editModeRoot}>
      <div>
        <div className={S.topToolbar}>
          <Button
            label={"New"}
            onClick={() => this.newTableView()}/>
          <Button
            label={"Edit"}
            onClick={() => this.onEdit()}/>
        </div>
        <SimpleListView
          items={this.views}
          onSelectionChanged={item => this.currentView = item}
          selectedItem={this.currentView}/>
      </div>
      <div>
        <PivotTable
          data={this.props.data}
          renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
          {...this.currentView.tableState}
        />
      </div>
    </div>
  }

  render() {
    return (
      this.showEditMode
        ? this.renderEditMode()
        : this.renderDisplayMode()
    );
  }
}

class TableView implements IListViewItem {
  @observable
  name = ""

  persistedState: IPersistAbleState;

  constructor(name: string, public id: string, state: ITableState) {
    this.name = name;
    this.tableState = state;
    this.persistedState = {
      name: this.name,
      tableState: state
    };
  }

  private toPersistAbleState() {
    return {
      name: this.name,
      tableState: {
        aggregatorName: this.tableState.aggregatorName,
        colOrder: toJS(this.tableState.colOrder),
        cols: toJS(this.tableState.cols),
        rendererName: this.tableState.rendererName,
        rowOrder: toJS(this.tableState.rowOrder),
        rows: toJS(this.tableState.rows),
        vals: toJS(this.tableState.vals),
      }
    }
  }

  updatePersistedState() {
    this.persistedState = this.toPersistAbleState();
  }

  @observable
  tableState: ITableState = {};
}

interface IPersistAbleState {
  name: string;
  tableState: ITableState;
}

interface ITableState {
  [key: string]: string | string[] | ITableState;
}