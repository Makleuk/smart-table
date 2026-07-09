export function initFiltering(filterElements) {
    const applyFiltering = (query, state, action) => {
        if (action && action.name === 'clear') {
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
            newQuery['filter[date]'] = state.date;
        }
        
        if (state.customer?.trim()) {
            newQuery['filter[customer]'] = state.customer;
        }
        
        // Для продавца передаем имя, а не ID
        if (state.seller && state.seller !== '') {
            newQuery['filter[seller]'] = state.seller;
        }
        
        if (state.totalFrom?.trim()) {
            const from = parseFloat(state.totalFrom);
            if (!isNaN(from) && from >= 0) {
                newQuery['filter[totalFrom]'] = from;
            }
        }
        
        if (state.totalTo?.trim()) {
            const to = parseFloat(state.totalTo);
            if (!isNaN(to) && to >= 0) {
                newQuery['filter[totalTo]'] = to;
            }
        }
        
        return newQuery;
    };

    const updateIndexes = (elements, indexes) => {
        const sellerSelect = elements.searchBySeller;
        if (sellerSelect) {
            const currentValue = sellerSelect.value;
            
            while (sellerSelect.options.length > 1) {
                sellerSelect.remove(1);
            }
            
            const sellersData = indexes.searchBySeller;
            
            if (sellersData) {
                // Сервер возвращает объект { seller_1: 'Alexey Petrov', ... }
                // Для value используем имя продавца (а не ID), так как сервер ожидает имя
                Object.entries(sellersData).forEach(([id, name]) => {
                    const option = document.createElement('option');
                    option.value = name; // Используем имя как value
                    option.textContent = name;
                    sellerSelect.appendChild(option);
                });
            }
            
            if (currentValue) {
                sellerSelect.value = currentValue;
            }
        }
    };

    return {
        applyFiltering,
        updateIndexes
    };
}