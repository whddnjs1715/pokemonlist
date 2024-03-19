import {useEffect, useRef, useState, KeyboardEvent, SyntheticEvent} from 'react'
import API from 'service/api'
import {
    PokemonInfoStatsStatModel, 
    PokemonInfoTypesModel, 
    PokemonListModel, 
    PokemonFilterListModel, 
    PokemonSessionStorageDataModel
} from 'model/pokemonmodel'
import { useRouter } from 'next/router';
import Pagination from 'components/common/pagination'

const UserMain = () => {
    const router = useRouter();
    const [pokemonTotalListCount, setPokemonTotalListCount] = useState<number | undefined>(undefined)
    const [pokemonList, setPokemonList] = useState<Array<PokemonListModel>>([])
    const [pokemonTypeList, setPokemonTypeList] = useState<Array<PokemonInfoStatsStatModel>>([])
    const [pokemonGenerationList, setPokemonGenerationList] = useState<Array<PokemonInfoStatsStatModel>>([])
    const [currentSearchTarget, setCurrentSearchTarget] = useState<string>('')
    const [searchList, setSearchList] = useState<string>('')
    const myElementRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const elementDiv = myElementRef.current;
    const [storedSearchData, setStoredSearchData] = useState<PokemonSessionStorageDataModel>({
        page: 1,
        type: '',
        generation: '',
        search: '',
    })

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
                alert('No Pokémon found in the search.')
                console.log('err', err)
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
        for(let i=1; i<=1025; i++){
            getPokemonInfoAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon/${i}`) 
            await getPokemonInfoAPI.current.call()
        }
    }   
    
    //[Button] onClick search
    const onClickSearchPokemon = () => {
        setSearchList('')
        if(!currentSearchTarget || currentSearchTarget === '') {
            alert('Please enter the search term.')
            if(pokemonTotalListCount && pokemonTotalListCount>0) setPokemonLists(pokemonTotalListCount)
            else return
        }else {
            setStoredSearchData({ ...storedSearchData, search: currentSearchTarget,})
            getPokemonSearchInfoAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon-species/${currentSearchTarget.toLocaleLowerCase()}`)
            getPokemonSearchInfoAPI.current.call()
        }
    }

    const onClickPokemonDetail = (value: PokemonListModel) => {
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
        const CurrentE = e
        if(e === '') {
            if(elementDiv) elementDiv.innerHTML = ""
            return
        }
        
        if(elementDiv) elementDiv.innerHTML = ""
        pokemonList.filter(e => e.name.startsWith(CurrentE) || e.name.toString() === CurrentE).map((value, index) => {
            if(index > 10) return
            const elementLi = document.createElement("li");
            elementLi.style.cursor= 'pointer'
            elementLi.className = 'relKeywordsLi'
            elementLi.innerHTML = value.name;
            if(elementDiv) elementDiv.appendChild(elementLi)
        })
    }

    const handleClick = (e: SyntheticEvent<HTMLUListElement, MouseEvent>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'LI') {
            if(inputRef.current) inputRef.current.value = target.textContent ?? ''
            setCurrentSearchTarget(target.textContent ?? '');
            setStoredSearchData({ ...storedSearchData, search: target.textContent ?? '',})
            if(elementDiv) elementDiv.innerHTML = ""
        }
    }; 

    // search Enter
    const onKeyDownEnter = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onClickSearchPokemon()
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
                            onKeyDown={onKeyDownEnter}
                            ref={inputRef}
                        />
                        <div 
                            className='relSearch'
                            style={{border: '1px solid rgba(0,0,0, 0.1)', borderRadius: '6px'}}
                        >
                            <ul className="relKeywords" ref={myElementRef} style={{listStyle: 'none', marginRight: '30px'}} onClick={handleClick}>
                            </ul>
                        </div>
                        
                    </li>
                    <li>
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
                                    <option 
                                        key={`option_type_${index}`}
                                        value={`${value.name}`}
                                    >
                                        {value.name?.toUpperCase()}
                                    </option>
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
                                    <option 
                                        key={`option_gen_${index}`}
                                        value={`${value.name.toLocaleLowerCase()}`}
                                    >
                                        {value.name?.toUpperCase()}
                                    </option>
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
                                        <td>{value.id ?? '-'}</td>
                                        <td>{value.name ?? '-'}</td>
                                        <td>{value.gen ?? '-'}</td>
                                        <td>{value.type ?? '-'}</td>
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