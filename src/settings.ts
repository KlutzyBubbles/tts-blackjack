export default class Settings {

    public static definitions: { [key: string]: string } = {
        ignoreFolderTags: 'array',
        ignoreTags: 'array',
    }

    /*
    Ignores tags before '.' e.g. 'commands' ignores 'commands.handler' logs.
    Folder is '' if none is found and should use ignoreTags for root items
    */
    public static ignoreFolderTags: string[] = ['commands'];

    /*
    Ignores tags e.g. 'commands.handler' ignores 'commands.handler' logs but not 'commands.settings'.
    */
    public static ignoreTags: string[] = [];

    public static countForSafe: number = 5;
    public static dealerBustCount: number = 5;

    public static loadTime: number = 60;
    public static bonusTime: number = 1200;

    public static turnTimeLimit: number = 0;

    public static splitOnValue: boolean = false;
    public static dealerAceIsOne: boolean = true;

    public static turnTimeLimitEnds: boolean = true;

}