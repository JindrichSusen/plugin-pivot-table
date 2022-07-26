import { ILocalizer, IPluginProperty } from "@origam/plugin-interfaces";
import { aggregators } from "react-pivottable/Utilities";
import { localizations } from "./PivotTablePluginLocalization";
import { ITableState } from "./interfaces";
import { toJS } from "mobx";


export class PivotTableTranslator {
  locale: string;
  private T: (key: string, parameters?: { [p: string]: any }) => string;
  translatedAggregators: { [key: string]: string };
  private properties: IPluginProperty[];

  constructor(localizer: ILocalizer, properties: IPluginProperty[]) {
    this.properties = properties;

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

  localize(state: ITableState) {
    this.localizeAggregatorName(state);
    state.cols = this.propertyIdsToNames(state.cols as string[]);
    state.rows = this.propertyIdsToNames(state.rows as string[]);
    return state;
  }

  propertyIdsToNames(ids: string[] | undefined) {
    if (!ids) {
      return [];
    }
    const names = [];
    for (const id of ids) {
      let property = this.properties.find(prop => prop.id === id);
      if (!property) {
        console.warn(`Property with id: ${id} was not found. All properties were removed as a consequence.`)
        return [];
      }
      names.push(property.name);
    }
    return names;
  }

  propertyNameToId(name: string) {
    let property = this.properties.find(prop => prop.name === name);
    if (!property) {
      throw new Error(`Property with name: ${name} was not found. The table config could not be saved.`)
    }
    return property.id;
  }

  private localizeAggregatorName(state: ITableState) {
    const localization = this.getCurrentLocalization();
    const originalName = state["aggregatorName"] as string;
    if (originalName && localization.translations[originalName]) {
      state["aggregatorName"] = this.T(originalName);
    } else {
      state["aggregatorName"] = this.T("Count");
    }
    return state;
  }

  normalize(state: ITableState) {
    const cols = (state.cols as string[]).map(propertyName => this.propertyNameToId(propertyName));
    const rows = (state.rows as string[]).map(propertyName => this.propertyNameToId(propertyName));
    return {
      aggregatorName: this.localizedAggregatorNameToKey(state.aggregatorName as string),
      colOrder: toJS(state.colOrder),
      cols: toJS(cols),
      rendererName: state.rendererName,
      rowOrder: toJS(state.rowOrder),
      rows: toJS(rows),
      vals: toJS(state.vals),
    };
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