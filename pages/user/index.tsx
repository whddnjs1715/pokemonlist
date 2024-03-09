import {useEffect, useRef, useState} from 'react'
import API from 'service/api'
import {PokemonInfoStatsStatModel, PokemonInfoTypesModel, PokemonListModel, PokemonFilterListModel} from 'model/pokemonmodel'
import { useRouter } from 'next/router';
import Pagination from 'components/common/pagination'

const UserMain = () => {
    const router = useRouter();
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [pokemonTotalListCount, setPokemonTotalListCount] = useState<number | undefined>(undefined)
    const [pokemonList, setPokemonList] = useState<Array<PokemonListModel>>([])
    const [pokemonTypeList, setPokemonTypeList] = useState<Array<PokemonInfoStatsStatModel>>([])
    const [pokemonGenerationList, setPokemonGenerationList] = useState<Array<PokemonInfoStatsStatModel>>([])
    const [currentFilterType, setCurrentFilterType] = useState<string>('')
    const [currentFilterGen, setCurrentFilterGen] = useState<string>('')
    const [currentSearchTarget, setCurrentSearchTarget] = useState<string>('')
    const [searchList, setSearchList] = useState<string>('')

    //[API] pokemon list
    const getPokemonTotalListAPI = useRef(
        new API(`https://pokeapi.co/api/v2/pokemon`, 'GET', {
            success: (res) => {
                setPokemonTotalListCount(res.count ?? 0)
            },
            error: (err) => {
                console.log(err)
            },
        })
    )   
    
    //[API] type
    const getPokemonTypeAPI = useRef(
        new API(`https://pokeapi.co/api/v2/type`, 'GET', {
            success: (res: PokemonFilterListModel) => {
                setPokemonTypeList(res.results)
            },
            error: (err) => {
                console.log(err)
            },
        })
    ) 
    
    //[API] generation
    const getPokemonGenerationAPI = useRef(
        new API(`https://pokeapi.co/api/v2/generation`, 'GET', {
            success: (res: PokemonFilterListModel) => {
                setPokemonGenerationList(res.results)
            },
            error: (err) => {
                console.log(err)
            },
        })
    )     

    //[API] pokemon info
    const getPokemonInfoAPI = useRef(
        new API(`https://pokeapi.co/api/v2/pokemon/1`, 'GET', {
            success: (res) => {
                let types = ''
                res.types.map((value: PokemonInfoTypesModel, index:number) => {
                    if(index > 0) types += ', '+ value.type.name
                    else types += value.type.name
                })
                let generation = 'Generation-i'
                if(res.id > 151 && res.id <252) generation = 'Generation-ii'
                else if(res.id > 251 && res.id < 387) generation = 'Generation-iii'
                else if(res.id > 386 && res.id < 495) generation = 'Generation-iv'
                else if(res.id > 494 && res.id < 650) generation = 'Generation-v'
                else if(res.id > 649 && res.id < 722) generation = 'Generation-vi'
                else if(res.id > 721 && res.id < 810) generation = 'Generation-vii'
                else if(res.id > 809 && res.id < 906) generation = 'Generation-viii'
                else if(res.id > 905) generation = 'Generation-ix'
                setPokemonList(prevItems => [
                    ...prevItems,
                    {
                        id: res.id,
                        name: res.name,
                        gen: generation,
                        type: types,
                    }
                ]);
            },
            error: (err) => {
                // console.log(err)
            },
        })
    )

    //[API] pokemon search info
    const getPokemonSearchInfoAPI = useRef(
        new API(`https://pokeapi.co/api/v2/pokemon/pikachu`, 'GET', {
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

    //[API] pokemon evolution-chain
    const getPokemonEvolutionChainAPI = useRef(
        new API(``, 'GET', {
            success: (res) => {
                let arr = [] 
                arr.push(res.chain.species.name ?? '')
                if(res.chain.evolves_to && res.chain.evolves_to.length > 0) {
                    for(let i=0; i<res.chain.evolves_to.length; i++){
                        arr.push(res.chain.evolves_to[i].species.name ?? '')
                        if(res.chain.evolves_to[i].evolves_to && res.chain.evolves_to[i].evolves_to.length > 0) {
                            for(let j=0; j<res.chain.evolves_to[i].evolves_to.length; j++){
                                arr.push(res.chain.evolves_to[i].evolves_to[j].species.name ?? '')
                            }
                        }
                    }
                }
                setSearchList(arr.join(', '))
            },
            error: (err) => {
                console.log(err)
            },
        })
    )      

    const setPokemonLists = async (count: number) => {
        for(let i=1; i<count; i++){
            if(i > 1025) return
            getPokemonInfoAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon/${i}`) 
            await getPokemonInfoAPI.current.call()
        }
    }
    
    //[API] pokemon search info
    const tmpAPI = useRef(
        new API(`https://pokeapi.co/api/v2/pokemon/pikachu`, 'GET', {
            success: (res) => {
                console.log(res)
            },
            error: (err) => {
                console.log(err)
            },
        })
    )      
    
    // search button onClick
    const onClickSearchPokemon = () => {
        setSearchList('')
        if(!currentSearchTarget || currentSearchTarget === '') {
            if(pokemonTotalListCount && pokemonTotalListCount>0) setPokemonLists(pokemonTotalListCount)
            else return
        }else {
            getPokemonSearchInfoAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon-species/${currentSearchTarget.toLocaleLowerCase()}`)
            getPokemonSearchInfoAPI.current.call()
        }
    }

    const onClickPokemonDetail = (value: PokemonListModel) => {
        router.push(`/detail/pokemon?id=${value.id}`)
    }

    const onChangePage = (page: number) => {
        setPageNumber(page)
    }

    // filter type change
    const onChangeTypeName = (e: string) => {
        setCurrentFilterType(e)
    }

    // filter generation change
    const onChangeGenrationName = (e: string) => {
        setCurrentFilterGen(e)
    }

    const onChangeSearchPokemon = (e: string) => {
        setCurrentSearchTarget(e)
    }

    useEffect(() => {
        getPokemonTotalListAPI.current.call()
        getPokemonTypeAPI.current.call()
        getPokemonGenerationAPI.current.call()
        tmpAPI.current.setUrl(`https://pokeapi.co/api/v2/generation/9`)
        tmpAPI.current.call()
    }, [])

    useEffect(() => {
        if(pokemonTotalListCount && pokemonTotalListCount>0) setPokemonLists(pokemonTotalListCount)
    }, [pokemonTotalListCount])

    return (
        <>
            <div className='searchWrap'>
                <ul 
                    className='SearchUl'
                    style={{listStyle: 'none', display: 'flex'}}
                >
                    <li>
                        <input 
                            className='searchInput'
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                onChangeSearchPokemon(e.currentTarget.value)
                            }}
                        />
                        <button className='searchButton' onClick={() => {onClickSearchPokemon()}}>Search</button>
                    </li>
                    <li style={{marginLeft: '20px'}}>
                        <select 
                            name="selectTypeFilter" 
                            style={{width: '150px', height: '30px'}}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                onChangeTypeName(e.currentTarget.value)
                            }}
                        >
                            <option value="total">TOTAL</option>
                            {pokemonTypeList.map((value, index) => {
                                return (
                                    <option value={`${value.name}`}>{value.name?.toUpperCase()}</option>
                                )
                            })}
                        </select>
                    </li>
                    <li style={{marginLeft: '20px'}}>
                        <select 
                            name="selectGenerationFilter" 
                            style={{width: '150px', height: '30px'}}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                onChangeGenrationName(e.currentTarget.value)
                            }}
                        >
                            <option value="total">TOTAL</option>
                            {pokemonGenerationList.map((value, index) => {
                                return (
                                    <option value={`${value.name}`}>{value.name?.toUpperCase()}</option>
                                )
                            })}
                        </select>

                    </li>                    
                </ul>
            </div>       
            <div className='tableWrap'>
                <table 
                    className='listTable'
                    style={{width: '100%', borderSpacing: '15px'}}
                >
                    <colgroup>
                        <col></col>
                        <col></col>
                        <col></col>
                        <col></col>
                    </colgroup>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Generations</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pokemonList.filter((value, index, self) => 
                            index === self.findIndex((e) => e.name === value.name)
                        ).filter(e => {
                            if(currentFilterType === 'total') return e.type.indexOf('') >= 0
                            else return e.type.indexOf(currentFilterType) >= 0
                        }).filter(e => {
                            if(currentFilterGen === 'total') return e.gen.indexOf('') >= 0
                            else return e.gen.toLowerCase().indexOf(currentFilterGen) >= 0
                        }).filter((e => {
                            if(searchList === '') return searchList.indexOf('') >= 0
                            else return searchList.indexOf(e.name) >= 0
                        })).map((value, index) => {
                            if((pageNumber*10) < value.id) return <></>
                            return (
                                <>
                                    <tr 
                                        key={`pokemon_${(index+1)}`}
                                        style={{textAlign: "center", cursor: "pointer"}}
                                        onClick={() => {onClickPokemonDetail(value)}}
                                    >
                                        <td>{value.id}</td>
                                        <td>{value.name}</td>
                                        <td>{value.gen}</td>
                                        <td>{value.type}</td>
                                    </tr>
                                </>
                            )
                        })}                                              
                    </tbody>
                </table>
            </div>
            <Pagination onChangePage={onChangePage} page={pageNumber}/>
        </>
    )
}

export default UserMain