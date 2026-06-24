export function initSearching(searchField) {
    return (query, state, action) => {
        return state[searchField] && state[searchField].trim() 
            ? { ...query, search: state[searchField] }
            : query;
    }
}