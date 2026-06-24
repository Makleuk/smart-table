export function initFiltering(filterElements) {
    const applyFiltering = (query, state, action) => {
        // Обработка очистки фильтра при клике на иконку
        if (action?.name === 'clear') {
            const field = action.dataset.field;
            const input = action.closest('.filter-wrapper')?.querySelector('input');
            
            if (input) {
                input.value = '';
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            return query;
        }

        const newQuery = { ...query };
        
        if (state.date?.trim()) {
            newQuery.date = state.date;
        }
        if (state.customer?.trim()) {
            newQuery.customer = state.customer;
        }
        if (state.seller && state.seller !== '') {
            newQuery.seller = state.seller;
        }
        if (state.totalFrom?.trim()) {
            newQuery.totalFrom = state.totalFrom;
        }
        if (state.totalTo?.trim()) {
            newQuery.totalTo = state.totalTo;
        }
        
        return newQuery;
    };

    const updateIndexes = (elements, indexes) => {
        const sellerSelect = elements.searchBySeller;
        if (!sellerSelect) return;

        const currentValue = sellerSelect.value;
        
        // Очищаем опции
        sellerSelect.length = 1;
        
        // Добавляем новые
        Object.entries(indexes.searchBySeller).forEach(([id, name]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            sellerSelect.appendChild(option);
        });
        
        if (currentValue) {
            sellerSelect.value = currentValue;
        }
    };

    return {
        applyFiltering,
        updateIndexes
    };
}