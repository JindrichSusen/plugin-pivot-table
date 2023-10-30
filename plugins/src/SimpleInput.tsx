import { observer } from "mobx-react";
import React from "react";
import S from "./SimpleInput.module.scss";
import cx from "classnames";


@observer
export class SimpleInput extends React.PureComponent<{
  errorMessage?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>)=> void;
  placeholder?: string;
  className?: string;
}> {

  render() {
    return (
      <div className={cx(S.editorContainer, this.props.className)}>
        <input
          className={S.input}
          value={this.props.value}
          onChange={event => this.props.onChange(event)}
          placeholder={this.props.placeholder}/>
        {this.props.errorMessage && (
          <div className={S.notification} title={this.props.errorMessage}>
            <i className="fas fa-exclamation-circle red"/>
          </div>
        )}
      </div>
    );
  }
}