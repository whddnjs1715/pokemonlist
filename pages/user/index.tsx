import {useEffect, useRef, useState, KeyboardEvent, SyntheticEvent} from 'react'
import API from 'service/api'
import { useRouter } from 'next/router';
import Pagination from 'components/common/pagination'
import Common from 'styles/common.module.scss'
import {
    PokemonInfoStatsStatModel, 
    PokemonInfoTypesModel, 
    PokemonListModel, 
    PokemonFilterListModel, 
    PokemonSessionStorageDataModel
} from 'model/pokemonmodel'

const UserMain = () => {
    const router = useRouter();
    //[변수] 총 포켓몬 수 확인을 위한 변수 / Total Pokemon Count
    const [pokemonTotalListCount, setPokemonTotalListCount] = useState<number | undefined>(undefined)
    //[변수] 실 포켓몬 리스트 변수 Pokemon List
    const [pokemonList, setPokemonList] = useState<Array<PokemonListModel>>([])
    //[변수] 포켓몬 타입 필터를 위한 모든 포켓몬 타입 리스트 변수 / Pokemon Type List for filter
    const [pokemonTypeList, setPokemonTypeList] = useState<Array<PokemonInfoStatsStatModel>>([])
    //[변수] 포켓몬 세대 필터를 위한 모든 포켓몬 세대 리스트 변수 / Pokemon Generations List for filter
    const [pokemonGenerationList, setPokemonGenerationList] = useState<Array<PokemonInfoStatsStatModel>>([])
    //[변수] 검색창에 입력시 현재 검색어를 보여주는 변수
    const [currentSearchTarget, setCurrentSearchTarget] = useState<string>('')
    //[변수] 검색한 포켓몬 진화 체인 리스트를 담는 변수
    const [searchList, setSearchList] = useState<string>('')
    //[변수] ul 태그를 담은 변수(추천 검색어를 보여주기 위함)
    const ulElementRef = useRef<HTMLUListElement>(null);
    //[변수] input 태그를 담은 변수(추천 검색어를 보여주기 위함)
    const inputElementRef = useRef<HTMLInputElement>(null);
    //[변수] ul 태그를 담은 변수
    const ulElementCurrent = ulElementRef.current;
    //[변수] 기본 검색 정보(페이지, 타입, 세대, 검색어) 세션스토리지 및 default value에 사용하기 위함
    const [storedSearchData, setStoredSearchData] = useState<PokemonSessionStorageDataModel>({
        page: 1,
        type: '',
        generation: '',
        search: '',
    })

    //// Make List Start ----

    //[API] 총 포켓몬 수 확인을 위한 API / Total Pokemon list API
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

    useEffect(() => {
        if(pokemonTotalListCount && pokemonTotalListCount>0) setPokemonLists(pokemonTotalListCount)
    }, [pokemonTotalListCount])    

    //[fun] 총 포켓몬 수 만큼 포켓몬 반복문을 통해 포켓몬 정보 API 호출
    const setPokemonLists = async (count: number) => {
        for(let i=1; i<=count; i++){
            if(i>1025) return
            getPokemonInfoAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon/${i}`) 
            await getPokemonInfoAPI.current.call()
        }
    }    

    //[API] 포켓몬 타입,세대,이름을 조회하는 API / Pokemon info(Type, Generation, Name) API
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

    //[API] 총 포켓몬 타입 리스트 API / Total Pokemon Type API
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

    //[API] 총 포켓몬 세대 리스트 API / Total Pokemon Generation API
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


    //// Make List Finish ----

    //// Pokemon Search Start ----

    //[fun] input창에 검색어를 입력하면 검색어를 바꿔서 보여주는 기능 / Type Keyword Show Search Bar
    //[fun] input창에 검색어를 입력하면 추천 검색어를 보여주는 기능 / Type Keyword Show Similar Pokemon Name list
    const onChangeSearchPokemon = (e: string) => {
        setCurrentSearchTarget(e)
        const CurrentE = e
        if(e === '') {
            if(ulElementCurrent) ulElementCurrent.innerHTML = ""
            return
        }
        
        if(ulElementCurrent) ulElementCurrent.innerHTML = ""
        pokemonList.filter(e => e.name.startsWith(CurrentE) || e.name.toString() === CurrentE).map((value, index) => {
            if(index > 10) return
            const elementLi = document.createElement("li");
            elementLi.style.cursor= 'pointer'
            elementLi.className = 'relKeywordsLi'
            elementLi.innerHTML = value.name;
            console.log('ulElementCurrent', ulElementCurrent)
            if(ulElementCurrent) ulElementCurrent.appendChild(elementLi)
        })
    }

    //[fun] input창에 추천 검색어를 클릭하면 input창에 보여주는 기능 / Click Similar Pokemon Name list show in Search Bar
    const onClickAppendChild = (e: SyntheticEvent<HTMLUListElement, MouseEvent>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'LI') {
            if(inputElementRef.current) inputElementRef.current.value = target.textContent ?? ''
            setCurrentSearchTarget(target.textContent ?? '');
            setStoredSearchData({ ...storedSearchData, search: target.textContent ?? '',})
            if(ulElementCurrent) ulElementCurrent.innerHTML = ""
        }
    }

    //[fun] 포켓몬 검색하는 기능 / Search Pokemon 
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

    //[fun] input창에 입력후 엔터 시 검색할 수 있게하는 기능 / function for Search with 'Enter'
    const onKeyDownEnter = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onClickSearchPokemon()
    }    

    //[API] 검색한 포켓몬의 진화 넘버를 알기위한 API / Search Pokemon Evolution Chain Number API
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

    //[API] 검색한 포켓몬의 진화 종류를 알기위한 API / Search Pokemon Evolution Chain Info API
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

    //// Pokemon Search Finsih ----

    //[fun] 포켓몬 리스트를 더 보여주는 버튼 / More Pokemon List Button
    const onChangePage = (page: number) => {
        setStoredSearchData({
            ...storedSearchData,
            page: page,
        })
    }

    //[fun] 포켓몬 타입 필터 기능 / Pokemon Filter Type Change
    const onChangeTypeName = (e: string) => {
        if(e === '') return
        if(e === 'total') setStoredSearchData({...storedSearchData, type: '',})
        else setStoredSearchData({...storedSearchData, type: e,})
    }

    //[fun] 포켓몬 세대 필터 기능 / Pokemon Filter Genration Change
    const onChangeGenrationName = (e: string) => {
        if(e === '') return
        if(e === 'total') setStoredSearchData({...storedSearchData, generation: '',})
        else setStoredSearchData({...storedSearchData, generation: e,})
    }

    //[fun] 포켓몬 디테일 페이지로 이동하는 기능 / Move Pokemon Detail Page
    //[fun] 리스트 페이지로 돌아와서도 검색한 정보를 남겨놓기위한 세션스토리지에 정보 저장 / Save Search Info in Session Storage
    const onClickPokemonDetail = (value: PokemonListModel) => {
        let jsonStorage = JSON.stringify(storedSearchData)
        sessionStorage.setItem('storage', jsonStorage)

        router.push(`/detail/pokemon?id=${value.id}&name=${value.name}`)
    }    

    //[fun] 새로고침 시 세션스토리지 검색 정보 제거 / Delete Session Storage Info with Refresh
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
            <div >
                <ul className={Common.SearchUl}>
                    <li>
                        <input 
                            className='searchInput'
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                onChangeSearchPokemon(e.currentTarget.value)
                            }}
                            defaultValue={storedSearchData.search}
                            onKeyDown={onKeyDownEnter}
                            ref={inputElementRef}
                        />
                        <div className={Common.relSearch}>
                            <ul 
                                className={Common.relKeywords}
                                ref={ulElementRef} 
                                onClick={onClickAppendChild}
                            >
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
                    <li className={Common.filterWrap}>
                        <select 
                            className={Common.selectTypeGenFilter}
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
                    <li className={Common.filterWrap}>
                        <select 
                            className={Common.selectTypeGenFilter}
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
            <div className={Common.tableWrap}>
                <table className={Common.listTable}>
                    <colgroup>
                        <col width='5%' />
                        <col width='35%' />
                        <col width='25%' />
                        <col width='35%' />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className={Common.tablePartTh}>ID</th>
                            <th className={Common.tablePartTh}>Name</th>
                            <th className={Common.tablePartTh}>Generations</th>
                            <th className={Common.tablePartTh}>Type</th>
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
                            if((storedSearchData.page*20) < value.id) return <></>
                            return (
                                <>
                                    <tr 
                                        key={`pokemon_${(index+1)}`}
                                        className={Common.listTr}
                                        onClick={() => {onClickPokemonDetail(value)}}
                                    >
                                        <td className={Common.tablePartTd}>{value.id ?? '-'}</td>
                                        <td className={Common.tablePartTd}>{value.name ?? '-'}</td>
                                        <td className={Common.tablePartTd}>{value.gen ?? '-'}</td>
                                        <td className={Common.tablePartTd}>{value.type ?? '-'}</td>
                                    </tr>
                                </>
                            )
                        }) : 
                        <>
                            <tr className={Common.listTrNone}>
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