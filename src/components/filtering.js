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
        
        if (state.seller && state.seller !== '') {
            newQuery['filter[seller]'] = state.seller;
        }
        
        if (state.totalFrom?.trim()) {
            newQuery['filter[totalFrom]'] = state.totalFrom;
        }
        
        if (state.totalTo?.trim()) {
            newQuery['filter[totalTo]'] = state.totalTo;
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
                if (Array.isArray(sellersData)) {
                    sellersData.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.id;
                        option.textContent = item.name || item.first_name + ' ' + item.last_name;
                        sellerSelect.appendChild(option);
                    });
                } else if (typeof sellersData === 'object') {
                    Object.entries(sellersData).forEach(([id, name]) => {
                        const option = document.createElement('option');
                        option.value = id;
                        if (typeof name === 'object' && name !== null) {
                            option.textContent = name.first_name + ' ' + name.last_name || name.name || id;
                        } else {
                            option.textContent = name;
                        }
                        sellerSelect.appendChild(option);
                    });
                }
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