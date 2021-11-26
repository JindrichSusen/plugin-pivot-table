import { observer } from "mobx-react";
import React from "react";
import S from "./SimpleListView.module.scss";
import "./SimpleListView.module.scss";
import SD from "@origam/components/src/components/Dropdown/Dropdown.module.scss"
import cx from "classnames";
import { observable } from "mobx";
import { EditButton } from "./EditButton";

@observer
export class SimpleListView<T extends IListViewItem> extends React.PureComponent<{
  items: T[];
  onSelectionChanged?: (item: T) => void;
  onEditItemClicked: (item: T) => void;
  onNewItemClicked: () => void;
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
              className={bodyCellClass(i, this.props.selectedItem === item, this.itemWithCursorId === item.id )}
              key={item.id}
              onClick={() => this.onItemClick(item)}
              onMouseEnter={() => this.itemWithCursorId = item.id}
              onMouseLeave={() => this.itemWithCursorId = undefined}
            >
              <div className={S.itemText}>
                {item.name}
              </div>
              <div className={S.buttonContainer}>
                <EditButton
                  isEnabled={this.itemWithCursorId === item.id}
                  isVisible={this.itemWithCursorId === item.id}
                  onClick={() => this.props.onEditItemClicked(item)}
                  tooltip={"Edit"}
                />
              </div>
            </div>
          )
        }
        <div
          onClick={() => this.props.onNewItemClicked()}
          className={S.newItemButton}
        >
          Create New View
        </div>
      </div>
    );
  }
}

export interface IListViewItem {
  name: string;
  id: string
}

function bodyCellClass(rowIndex: number, selected: boolean, withCursor: boolean) {
  return cx(S.cell, "cell", rowIndex % 2 ? "ord2" : "ord1", {withCursor, selected});
}