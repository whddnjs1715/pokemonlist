import { PaginationProps } from "model/pokemonmodel"

const Pagination = (props: PaginationProps) => {

    return (
        <div 
            className="paginationContainer"
            style={{textAlign: "center", cursor: "pointer", marginTop: '30px'}}
        >
            <button 
                type='button' 
                onClick={() => props.onChangePage(props.page+1)}
            >
                more
            </button>
      </div>
    )
}

export default Pagination