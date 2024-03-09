import { PaginationProps, PokemonDetailInfoModel, PokemonInfoStatsModel, PokemonInfoTypesModel } from "model/pokemonmodel";
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react";
import API from "service/api";

const PokemonDetail = () => {
    const router = useRouter();
    const { id } = router.query;
    // if(id && !Array.isArray(id)) {
    //     console.log(parseInt(id))
    //     // console.log(parseInt(id) === NaN)
    //     console.log(isNaN(parseInt(id)))
    // }
    const [pokemonDetail, setPokemonDetail] = useState<PokemonDetailInfoModel>({
        name: '',
        img: '',
        types: [],
        stats: [],
    })

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
            },
            error: (err) => {
                console.log(err)
            },
        })
    )

    const getPokemonEvolutionAPI = useRef(
        new API(`https://pokeapi.co/api/v2/evolution-chain/1/`, 'GET', {
            success: (res) => {
                console.log('res', res)
            },
            error: (err) => {
                console.log(err)
            },
        })
    )    
    
    useEffect(() => {
        if(!id) return
        if(Array.isArray(id)) return
        router.push(`http://localhost:3000/detail/pokemon?id=${parseInt(id)}`)
        getPokemonDetailAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon/${parseInt(id)}`)
        getPokemonDetailAPI.current.call()
        // getPokemonEvolutionAPI.current.setUrl(`https://pokeapi.co/api/v2/evolution-chain/${id}`)
        // getPokemonEvolutionAPI.current.call()
    }, [id])

    if(id && Array.isArray(id)) return (<><h1>No Page</h1></>)
    if(id && !Array.isArray(id) && isNaN(parseInt(id))) return (<><h1>No Page</h1></>)

    return (
        <>
            <div className="container">
                <div 
                    className="contentWrap"
                    style={{display: 'flex'}}
                >
                    <div 
                        className="contentImg"
                        style={{width: '50%'}}
                    >
                        <img 
                            src={pokemonDetail.img ?? ''}
                            style={{width: '100%'}}
                        />
                    </div>
                    <div className="contentInfo">
                        <h3 style={{fontSize: '45px', margin: '0'}}>
                            <p 
                                style={{margin: '0', fontSize: '22px', color: '#999'}}
                            >
                                No. {id ?? ''}
                            </p>
                            {pokemonDetail.name}
                        </h3>
                        <div
                            className="contentInfoType" 
                            style={{marginTop: '20px', marginBottom: '20px'}}
                        >
                            {pokemonDetail.types.map((value: PokemonInfoTypesModel, index: number) => {
                                let upperCase = value.type.name?.toLocaleUpperCase()
                                return (
                                    <span 
                                        style={{background: '#9E2A22', padding: '10px', marginRight: '5px', color: '#fff', fontWeight: '500'}}
                                    >
                                        {upperCase}
                                    </span>
                                )
                            })}
                        </div>
                        <div 
                            className="contentInfoStat"
                            style={{border : '1px solid #999', borderRadius: '5px', padding: '10px'}}
                        >
                            {pokemonDetail.stats.map((value:PokemonInfoStatsModel, index:number) => {
                                return (
                                    <p>
                                        <span style={{fontSize: '25px', fontWeight: '1000'}}>{value.stat.name ?? ''} : </span>
                                        <span style={{fontSize: '20px', fontWeight: '500'}}>{value.base_stat ?? ''}</span>
                                    </p>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                
            </div>
        </>
    )
}

export default PokemonDetail