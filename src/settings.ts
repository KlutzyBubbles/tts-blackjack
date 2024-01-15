export default class Settings {

    public static definitions: { [key: string]: string } = {
        ignoreFolderTags: 'array',
        ignoreTags: 'array',
    }

    public static ignoreFolderTags: string[] = ['commands'];
    public static ignoreTags: string[] = [];

}