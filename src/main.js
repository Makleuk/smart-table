import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";
import {initTable} from "./components/table.js";
import {initSorting} from "./components/sorting.js"; 
import {initPagination} from "./components/pagination.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

const api = initData();

/**
 * Сбор и обработка полей из таблицы
 * @id70533735 (@returns) {Object}
 */
function collectState() {
    const formData = new FormData(sampleTable.container);
    const state = processFormData(formData);
    const rowsPerPage = parseInt(state.rowsPerPage);    
    const page = parseInt(state.page ?? 1);  

    console.log('=== collectState ===');
    console.log('Form data entries:');
    for (let [key, value] of formData.entries()) {
        console.log(key, '=', value);
    }
    console.log('State:', state);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    console.log('=== render called ===');
    let state = collectState(); 
    let query = {};
    
    // Порядок применения важен!
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    console.log('Final query before getRecords:', query);

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
    console.log('Found filter inputs:', inputs.length);
    inputs.forEach(input => {
        console.log('Input name:', input.getAttribute('name'), 'value:', input.value);
        input.addEventListener('input', () => {
            console.log('Input event on:', input.getAttribute('name'), 'value:', input.value);
            render();
        });
        input.addEventListener('change', () => {
            console.log('Change event on:', input.getAttribute('name'), 'value:', input.value);
            render();
        });
    });
   
    const sellerSelect = filterRow.querySelector('[data-name="searchBySeller"]');
    if (sellerSelect) {
        console.log('Found seller select:', sellerSelect);
        sellerSelect.addEventListener('change', () => {
            console.log('Seller select changed to:', sellerSelect.value);
            render();
        });
    } else {
        console.warn('Seller select not found!');
    }
}

async function init() {
    const indexes = await api.getIndexes();

    const sellersArray = Object.entries(indexes.sellers).map(([id, seller]) => ({
        id: id,
        name: `${seller.first_name} ${seller.last_name}`
    }));

    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: sellersArray
    });
    
    setupFilterListeners();
    
    return indexes;
}

init().then(render);