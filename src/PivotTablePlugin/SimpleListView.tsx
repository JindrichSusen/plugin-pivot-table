import { observer } from "mobx-react";
import React from "react";
import S from "./SimpleListView.module.scss";
import "./SimpleListView.module.scss";
import SD from "@origam/components/src/components/Dropdown/Dropdown.module.scss"
import cx from "classnames";
import { observable } from "mobx";

@observer
export class SimpleListView<T extends IListViewItem> extends React.PureComponent<{
  items: T[];
  onSelectionChanged?: (item: T) => void;
  selectedItem: T | undefined
}> {

  @observable
  itemWithCursorId: string | undefined;

  onItemClick(item: T) {
    if (this.props.onSelectionChanged) {
      this.props.onSelectionChanged(item);
    }
  }

  render() {
    return (
      <div className={S.root + " " + SD.table}>
        {this.props.items
          .map((item, i) =>
            <div
              key={item.id}
              className={bodyCellClass(i, this.props.selectedItem === item, this.itemWithCursorId === item.id )}
              onClick={() => this.onItemClick(item)}
              onMouseEnter={() => this.itemWithCursorId = item.id}
              onMouseLeave={() => this.itemWithCursorId = undefined}
            >
              {item.name}
          </div>
          )
        }
      </div>
    );
  }
}

export interface IListViewItem {
  name: string;
  id: string
}

function bodyCellClass(rowIndex: number, selected: boolean, withCursor: boolean) {
  return cx("cell", rowIndex % 2 ? "ord2" : "ord1", {withCursor, selected});
}