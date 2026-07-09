import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";
import {initTable} from "./components/table.js";
import {initSorting} from "./components/sorting.js"; 
import {initPagination} from "./components/pagination.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

const api = initData();

function collectState() {
    const formData = new FormData(sampleTable.container);
    const state = processFormData(formData);
    const rowsPerPage = parseInt(state.rowsPerPage);    
    const page = parseInt(state.page ?? 1);  

    return {
        ...state,
        rowsPerPage,
        page
    };
}

async function render(action) {
    let state = collectState(); 
    let query = {};
    
    // Порядок применения важен!
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    const { total, items } = await api.getRecords(query);
    updatePagination(total, query);           
    sampleTable.render(items)
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const applySearching = initSearching('search');

const {applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements);

const applySorting = initSorting([        
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]); 

const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,             
    (el, page, isCurrent) => {                    
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

function setupFilterListeners() {
    const filterRow = sampleTable.filter.container;
    
    const inputs = filterRow.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            render();
        });
        input.addEventListener('change', () => {
            render();
        });
    });
    
    const sellerSelect = filterRow.querySelector('[data-name="searchBySeller"]');
    if (sellerSelect) {
        sellerSelect.addEventListener('change', () => {
            render();
        });
    }
}

async function init() {
    const indexes = await api.getIndexes();

    // Для фильтра продавцов передаем объект { seller_1: 'Alexey Petrov', ... }
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
    
    setupFilterListeners();
    
    return indexes;
}

init().then(render);