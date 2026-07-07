export function initFiltering(filterElements) {
    const applyFiltering = (query, state, action) => {
        // Обработка очистки фильтра при клике на иконку
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            const input = action.closest('.filter-wrapper')?.querySelector('input');
            
            if (input) {
                input.value = ''; // Очищаем поле ввода
                // Обновляем state через событие change
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            // Не добавляем фильтр для этого поля в query
            return query;
        }

        // Применяем фильтры из state
        const newQuery = { ...query };
        
        // Date фильтр - используем searchByDate из state
        if (state.searchByDate?.trim()) {
            newQuery.date = state.searchByDate;
        } else {
            delete newQuery.date;
        }
        
        // Customer фильтр - используем searchByCustomer из state
        if (state.searchByCustomer?.trim()) {
            newQuery.customer = state.searchByCustomer;
        } else {
            delete newQuery.customer;
        }
        
        // Seller фильтр - используем searchBySeller из state
        if (state.searchBySeller && state.searchBySeller !== '') {
            newQuery.seller = state.searchBySeller;
        } else {
            delete newQuery.seller;
        }
        
        // Total from фильтр
        if (state.totalFrom?.trim()) {
            newQuery.totalFrom = state.totalFrom;
        } else {
            delete newQuery.totalFrom;
        }
        
        // Total to фильтр
        if (state.totalTo?.trim()) {
            newQuery.totalTo = state.totalTo;
        } else {
            delete newQuery.totalTo;
        }
        
        return newQuery;
    };

    const updateIndexes = (elements, indexes) => {
        // Обновляем селект с продавцами
        const sellerSelect = elements.searchBySeller;
        if (sellerSelect) {
            // Сохраняем выбранное значение
            const currentValue = sellerSelect.value;
            
            // Очищаем текущие опции кроме первой
            while (sellerSelect.options.length > 1) {
                sellerSelect.remove(1);
            }
            
            // Добавляем новые опции
            Object.entries(indexes.searchBySeller).forEach(([id, name]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                sellerSelect.appendChild(option);
            });
            
            // Восстанавливаем выбранное значение
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