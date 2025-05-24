export enum MenuKeys {
    INSTRUCTIONS = 'Instructions',
    MADRAS = 'MADRAS',
    REFERENTIAL = 'Referential',
    DATASCOPES = 'Datascopes',
    DATA_MAINTENANCE = 'Data Maintenance',
    FOLLOW_UP = 'Follow-Up',
    DEVELOPMENT = 'Development',
    ADMINISTRATION = 'Administration',
    GUIDELINES = 'Guidelines',
    POS = 'POS',
    LANGUAGE = 'Language'
}

export interface SubMenuItem {
    menuItemName: string;
    url: string;
    children?: SubMenuItem[];
}

export interface ExternalMenuItem {
    url: string;
}

export interface LanguageMenuItem {
    languageName: string;
    url: string;
    lanCode: string;
}

export interface MenuResponse {
    [MenuKeys.INSTRUCTIONS] : SubMenuItem[];
    [MenuKeys.MADRAS] : ExternalMenuItem;
    [MenuKeys.REFERENTIAL] : ExternalMenuItem;
    [MenuKeys.DATASCOPES] : ExternalMenuItem;
    [MenuKeys.DATA_MAINTENANCE] : ExternalMenuItem;
    [MenuKeys.FOLLOW_UP] : ExternalMenuItem;
    [MenuKeys.DEVELOPMENT] : SubMenuItem[];
    [MenuKeys.ADMINISTRATION] : SubMenuItem[];
    [MenuKeys.GUIDELINES] : SubMenuItem[];
    [MenuKeys.POS] : ExternalMenuItem;
    [MenuKeys.LANGUAGE] : LanguageMenuItem[];
}

export interface MenuResponseMap {
    subMenuType: string[];
    nonSubMenuType: string[];
    hrefMenuType: string[];
}

export interface MenuItem {
  menuItemName: string;
  url: string;
  children?: MenuItem[];
}
