import { ILocalizer } from "@origam/plugin-interfaces";
import { aggregators } from "react-pivottable/Utilities";
import { localizations } from "./PivotTablePluginLocalization";
import { ITableState } from "./interfaces";


export class AggregatorTranslator {
  locale: string;
  private T: (key: string, parameters?: { [p: string]: any }) => string;
  translatedAggregators: {[key: string]: string};

  constructor(localizer: ILocalizer) {
    this.T = localizer.translate.bind(localizer);
    this.locale = localizer.locale;
    this.translatedAggregators = this.translateAggregators();
  }

  translateAggregators() {
    const translatedAggregators = {};
    for (let aggregatorName of Object.keys(aggregators)) {
      translatedAggregators[this.T(aggregatorName)] = aggregators[aggregatorName];
    }
    return translatedAggregators;
  }

  translateAggregatorNames(state: ITableState) {
    console.log(state)
    const localization = this.getCurrentLocalization();
    console.log("aggregatorName before translation: " + state["aggregatorName"])
    if (state["aggregatorName"] && localization["aggregatorName"]) {
      state["aggregatorName"] = this.T(state["aggregatorName"] as string);
    } else {
      state["aggregatorName"] = this.T("Count");
    }
    console.log("aggregatorName: " + state["aggregatorName"])
    return state;
  }

  private getCurrentLocalization() {
    const localization = localizations.find(localization => localization["locale"] === this.locale);
    if (!localization) {
      throw new Error("Could not find localization for current locale: " + this.locale)
    }
    return localization;
  }

  localizedAggregatorNameToKey(localizedName: string) {
    if (!localizedName) {
      return localizedName;
    }
    const localization = this.getCurrentLocalization();
    const key = Object.keys(localization.translations).find(key => localization.translations[key] === localizedName);
    if (!key) {
      throw new Error(`Could not find localization key for aggregator named "${localizedName}"`)
    }
    return key;
  }
}