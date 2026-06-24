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