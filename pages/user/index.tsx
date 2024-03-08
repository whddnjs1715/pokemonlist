import {useEffect, useRef, useState} from 'react'
import API from 'service/api'
import {PokemonInfoTypesModel, PokemonListModel} from 'model/pokemonmodel'
import { useRouter } from 'next/router';

const UserMain = () => {
    const router = useRouter();
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [pokemonList, setPokemonList] = useState<Array<PokemonListModel>>([])

    const setPokemonLists = async () => {
        let page = (pageNumber-1)*10
        for(let i=1; i<11; i++){
            getPokemonListAPI.current.setUrl(`https://pokeapi.co/api/v2/pokemon/${page+i}`) 
            await getPokemonListAPI.current.call()
        }
        // console.log(pokemonList)
    }

    // pokemon list
    const getPokemonListAPI = useRef(
        new API(`https://pokeapi.co/api/v2/pokemon/1`, 'GET', {
            success: async (res) => {
                let types = ''
                res.types.map((value: PokemonInfoTypesModel, index:number) => {
                    if(index > 0) types += ', '+ value.type.name
                    else types += value.type.name
                })
                setPokemonList(prevItems => [
                    ...prevItems,
                    {
                        id: res.id,
                        name: res.name,
                        gen: '1',
                        type: types,
                    }
                ]);
            },
            error: (err) => {
                console.log(err)
            },
        })
    )  
    
    const onClickSearchPokemon = () => {
    }

    const onClickPokemonDetail = (value: PokemonListModel) => {
        router.push(`/detail/pokemon?id=${value.id}`)
    }

    useEffect(() => {
        setPokemonLists()
    }, [pageNumber])

    return (
        <>
            <div className='searchWrap'>
                <ul 
                    className='SearchUl'
                    style={{listStyle: 'none', display: 'flex'}}
                >
                    <li>
                        <input className='searchInput'></input>
                    </li>        
                    <li>
                        <button className='searchButton' onClick={onClickSearchPokemon}>Search</button>
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
                        ).map((value, index) => {
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
            {/* <Pagination> */}
        </>
    )
}

export default UserMain