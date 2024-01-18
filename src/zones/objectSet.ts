export default class ObjectSet {

    public zone: GObject;
    public container: GObject;
    public prestige: GObject;
    public actionButtons: GObject;
    public table: GObject;

    public value = 0;
    public count = 0;

    public constructor(zone: GObject, container: GObject, prestige: GObject, actionButtons: GObject, table: GObject) {
        this.zone = zone;
        this.container = container;
        this.prestige = prestige;
        this.actionButtons = actionButtons;
        this.table = table;
    }

}