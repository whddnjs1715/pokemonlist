import {useEffect, useRef, useState} from 'react'
import API from 'service/api'
import {PokemonInfoStatsStatModel, PokemonInfoTypesModel, PokemonListModel, PokemonFilterListModel, PokemonSessionStorageDataModel} from 'model/pokemonmodel'
import { useRouter } from 'next/router';
import Pagination from 'components/common/pagination'

const UserMain = () => {
    const router = useRouter();
    const [pokemonTotalListCount, setPokemonTotalListCount] = useState<number | undefined>(undefined)
    const [pokemonList, setPokemonList] = useState<Array<PokemonListModel>>([])
    const [pokemonTypeList, setPokemonTypeList] = useState<Array<PokemonInfoStatsStatModel>>([])
    const [pokemonGenerationList, setPokemonGenerationList] = useState<Array<PokemonInfoStatsStatModel>>([])
    const [currentSearchTarget, setCurrentSearchTarget] = useState<string>('')
    const [storedSearchData, setStoredSearchData] = useState<PokemonSessionStorageDataModel>({
        page: 1,
        type: '',
        generation: '',
        search: '',
    })
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
                if(res.id > 3 && res.id <252) generation = 'Generation-ii'
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
                console.log(err)
            },
        })
    )

    //[API] pokemon search info
    const getPokemonSearchInfoAPI = useRef(
        new API(`https://pokeapi.co/api/v2/pokemon-species/pikachu`, 'GET', {
            success: (res) => {
                let url = res.evolution_chain.url
                getPokemonEvolutionChainAPI.current.setUrl(url)
                getPokemonEvolutionChainAPI.current.call()
            },
            error: (err) => {
                setPokemonList([])
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
        for(let i=1; i<153; i++){
            getPokemonInfoAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon/${i}`) 
            await getPokemonInfoAPI.current.call()
        }
    }   
    
    //[Button] onClick search
    const onClickSearchPokemon = () => {
        setSearchList('')
        if(!currentSearchTarget || currentSearchTarget === '') {
            if(pokemonTotalListCount && pokemonTotalListCount>0) setPokemonLists(pokemonTotalListCount)
            else return
        }else {
            setStoredSearchData({ ...storedSearchData, search: currentSearchTarget,})
            getPokemonSearchInfoAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon-species/${currentSearchTarget.toLocaleLowerCase()}`)
            getPokemonSearchInfoAPI.current.call()
        }
    }

    const onClickPokemonDetail = (value: PokemonListModel) => {
        console.log(value)
        let jsonStorage = JSON.stringify(storedSearchData)
        sessionStorage.setItem('storage', jsonStorage)

        router.push(`/detail/pokemon?id=${value.id}&name=${value.name}`)
    }

    const onChangePage = (page: number) => {
        setStoredSearchData({
            ...storedSearchData,
            page: page,
        })
    }

    // filter type change
    const onChangeTypeName = (e: string) => {
        if(e === '') return
        if(e === 'total') setStoredSearchData({...storedSearchData, type: '',})
        else setStoredSearchData({...storedSearchData, type: e,})
    }

    // filter generation change
    const onChangeGenrationName = (e: string) => {
        if(e === '') return
        if(e === 'total') setStoredSearchData({...storedSearchData, generation: '',})
        else setStoredSearchData({...storedSearchData, generation: e,})
    }

    const onChangeSearchPokemon = (e: string) => {
        setCurrentSearchTarget(e)
    }

    useEffect(() => {
        getPokemonTotalListAPI.current.call()
        getPokemonGenerationAPI.current.call()
        getPokemonTypeAPI.current.call()
        const storedJsonSessionData = sessionStorage.getItem('storage');
        if(storedJsonSessionData){
            const storedSessionData = JSON.parse(storedJsonSessionData);
            setStoredSearchData({
                ...storedSearchData, 
                search: storedSessionData.search.toLocaleLowerCase(),
                type: storedSessionData.type.toLocaleLowerCase(),
                generation: storedSessionData.generation.toLocaleLowerCase(),
                page: storedSessionData.page,
            })
            if(storedSessionData.search !== ''){
                getPokemonSearchInfoAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon-species/${storedSessionData.search.toLocaleLowerCase()}`)
                getPokemonSearchInfoAPI.current.call()
            }
        }
    }, [])

    useEffect(() => {
        if(pokemonTotalListCount && pokemonTotalListCount>0) setPokemonLists(pokemonTotalListCount)
    }, [pokemonTotalListCount])

    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.clear();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [])

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
                            defaultValue={storedSearchData.search}
                        />
                        <button 
                            className='searchButton'
                            onClick={() => {onClickSearchPokemon()}}
                        >
                            Search
                        </button>
                    </li>
                    <li style={{marginLeft: '20px'}}>
                        <select 
                            name="selectTypeFilter" 
                            style={{width: '150px', height: '30px'}}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                onChangeTypeName(e.currentTarget.value)
                            }}
                            value={storedSearchData.type}
                        >
                            <option value="total">SELECT</option>
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
                            value={storedSearchData.generation}
                        >
                            <option value="total">SELECT</option>
                            {pokemonGenerationList.map((value, index) => {
                                return (
                                    <option value={`${value.name.toLocaleLowerCase()}`}>{value.name?.toUpperCase()}</option>
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
                        {pokemonList && pokemonList.length > 0 ? pokemonList.filter((value, index, self) => 
                            index === self.findIndex((e) => e.name === value.name)
                        ).filter(e => {
                            if(storedSearchData.type === 'total') return e.type.indexOf('') >= 0
                            else return e.type.indexOf(storedSearchData.type) >= 0
                        }).filter(e => {
                            if(storedSearchData.generation === 'total') return e.gen.indexOf('') >= 0
                            else return e.gen.toLowerCase().indexOf(storedSearchData.generation.toLocaleLowerCase()) >= 0
                        }).filter((e => {
                            if(searchList === '') return searchList.indexOf('') >= 0
                            else return searchList.indexOf(e.name) >= 0
                        })).map((value, index) => {
                            if((storedSearchData.page*10) < value.id) return <></>
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
                        }) : 
                        <>
                            <tr style={{textAlign: "center"}}>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>                            
                        </>}  
                    </tbody>
                </table>
            </div>
            <Pagination onChangePage={onChangePage} page={storedSearchData.page}/>
        </>
    )
}

export default UserMain