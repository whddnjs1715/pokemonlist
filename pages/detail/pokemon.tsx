import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react";
import API from "service/api";
import Common from 'styles/common.module.scss'
import { 
    PokemonDetailInfoModel, 
    PokemonInfoStatsModel, 
    PokemonInfoTypesModel, 
    pokemonEvolutionListModel 
} from "model/pokemonmodel";

const PokemonDetail = () => {
    const router = useRouter();
    //[변수] 해당 포켓몬 ID / Pokemon ID
    const { id } = router.query;
    //[변수] 해당 포켓몬 진화 리스트 정보 / Pokemon Evolution CHain Info
    const [pokemonEvolutionList, setPokemonEvolutionList] = useState<Array<pokemonEvolutionListModel>>([])
    //[변수] 해당 포켓몬 정보 / Pokemon Info
    const [pokemonDetail, setPokemonDetail] = useState<PokemonDetailInfoModel>({
        name: '',
        img: '',
        types: [],
        stats: [],
    })

    //// Pokemon Detail Info Start ----

    //[API] 라우터로 넘어온 포켓몬 아이디를 통해 해당 포켓몬 정보 조회 API / Pokemon Detail Info API with ID
    const getPokemonDetailAPI = useRef(
        new API(`https://pokeapi.co/api/v2/pokemon/1`, 'GET', {
            success: (res) => {
                setPokemonDetail({
                    ...pokemonDetail,
                    name: res.name,
                    img: res.sprites.front_default ?? '',
                    types: res.types,
                    stats: res.stats,
                })
                getPokemonSpeciesAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon-species/${res.name.toLocaleLowerCase()}`)
                getPokemonSpeciesAPI.current.call()
            },
            error: (err) => {
                console.log(err)
            },
        })
    )

    //[API] 포켓몬의 진화 url를 알기위한 API / pokemon species info
    const getPokemonSpeciesAPI = useRef(
        new API(`https://pokeapi.co/api/v2/pokemon-species/pikachu`, 'GET', {
            success: (res) => {
                let url = res.evolution_chain.url
                getPokemonEvolutionChainAPI.current.setUrl(url)
                getPokemonEvolutionChainAPI.current.call()
            },
            error: (err) => {
                console.log(err)
            },
        })
    ) 
    
    //[API] 검색한 포켓몬의 진화 종류를 알기위한 API / Search Pokemon Evolution Chain Info API
    const getPokemonEvolutionChainAPI = useRef(
        new API(`https://pokeapi.co/api/v2/evolution-chain/1/`, 'GET', {
            success: (res) => {
                let evolutionList = [] 
                evolutionList.push(res.chain.species.name ?? '')                
                if(res.chain.evolves_to && res.chain.evolves_to.length > 0) {
                    for(let i=0; i<res.chain.evolves_to.length; i++){
                        evolutionList.push(res.chain.evolves_to[i].species.name ?? '')
                        if(res.chain.evolves_to[i].evolves_to && res.chain.evolves_to[i].evolves_to.length > 0) {
                            for(let j=0; j<res.chain.evolves_to[i].evolves_to.length; j++){
                                evolutionList.push(res.chain.evolves_to[i].evolves_to[j].species.name ?? '')
                            }
                        }
                    }
                }
                getPokemonEvolutionImg(evolutionList)
            },
            error: (err) => {
                console.log(err)
            },
        })
    )
    
    //[fun] 조회한 진화 리스트를 통해 이미지를 얻기위한 기능 
    const getPokemonEvolutionImg = async (list: Array<string>) => {
        for(let i=0; i<list.length; i++){
            getPokemonEvolutionChainImgAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon/${list[i]}`)
            await getPokemonEvolutionChainImgAPI.current.call()
        }
    }
    
    //[API] 진화 리스트 이미지 API / Pokemon Evolution List Image API
    const getPokemonEvolutionChainImgAPI = useRef(
        new API(`https://pokeapi.co/api/v2/pokemon/1`, 'GET', {
            success: (res) => {
                setPokemonEvolutionList(prevItems => [
                    ...prevItems,
                    {
                        current: res.name === router.query.name ? true : false,
                        name: res.name ?? '',
                        img: res.sprites.front_default ?? '',
                    }
                ]);
            },
            error: (err) => {
                console.log(err)
            },
        })
    )     

    useEffect(() => {
        if(!id) return
        if(Array.isArray(id)) return
        getPokemonDetailAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon/${parseInt(id)}`)
        getPokemonDetailAPI.current.call()
    }, [id])

    //// Pokemon Detail Info Finish ----    

    if(!id) return (<><h1>No Page</h1></>)
    if(id && Array.isArray(id)) return (<><h1>No Page</h1></>)
    if(id && !Array.isArray(id) && isNaN(parseInt(id))) return (<><h1>No Page</h1></>)

    return (
        <>
            <div className="container">
                <div className={Common.contentWrap}>
                    <div className={Common.contentImgContainer}>
                        <img 
                            src={pokemonDetail.img ?? ''}
                            className={Common.contentImg}
                        />
                    </div>
                    <div className="contentInfo">
                        <h3 className={Common.contentInfoNoContainer}>
                            <p className={Common.contentInfoNo}>
                                No. {id ?? ''}
                            </p>
                            {pokemonDetail.name}
                        </h3>
                        <div className={Common.contentInfoTypeContainer}>
                            {pokemonDetail.types.map((value: PokemonInfoTypesModel, index: number) => {
                                let upperCase = value.type.name?.toLocaleUpperCase()
                                return (
                                    <span 
                                        key={`pokemon_type_${index}`}
                                        className={Common.contentInfoType}
                                    >
                                        {upperCase}
                                    </span>
                                )
                            })}
                        </div>
                        <div className={Common.contentInfoStatWrap}>
                            {pokemonDetail.stats.map((value:PokemonInfoStatsModel, index:number) => {
                                return (
                                    <p key={`pokemon_stat_${index}`}>
                                        <span className={Common.contentInfoStat} style={{fontSize: '25px', fontWeight: '1000'}}>{value.stat.name ?? ''} : </span>
                                        <span className={Common.contentInfoStat} style={{fontSize: '20px', fontWeight: '500'}}>{value.base_stat ?? ''}</span>
                                    </p>
                                )
                            })}
                        </div>
                        <div className={Common.contentInfoEvolutionContainer}>
                            {pokemonEvolutionList.filter((value, index, self) => 
                                index === self.findIndex((e) => e.name === value.name)
                                ).map((value, index) => {
                                    return (
                                        <div 
                                            key={`pokemon_evolution_${index}`}
                                            style={value.current ? {border: '1px solid rgba(255, 0, 0, 1)'} : {}}
                                        >
                                            <img src={value.img ?? ''}/>
                                            <p className={Common.contentInfoEvolutionName}>{value.name}</p>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PokemonDetail