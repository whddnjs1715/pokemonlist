export interface PokemonListModel {
    id: number,
    name: string,
    gen: string,
    type: string
}

export interface PokemonInfoModel {
    id: number,
    name: string,
    sprites: PokemonInfoSpritesModel,
    types: Array<PokemonInfoTypesModel>
}

export interface PokemonInfoSpritesModel {
    front_default: string | null,
    version: any,
}

export interface PokemonInfoTypesModel {
    slot: number,
    type: PokemonInfoTypestypeModel
}

export interface PokemonInfoTypestypeModel {
    name: string,
    url: string,
}

export interface PokemonDetailInfoModel {
    name: string,
    img: string,
    types: Array<PokemonInfoTypesModel>
    stats: Array<PokemonInfoStatsModel>
}

export interface PokemonInfoStatsModel {
    base_stat: number
    effort: number
    stat: PokemonInfoStatsStatModel
}

export interface PokemonInfoStatsStatModel {
    name: string,
    url: string,
}