// Импортируем данные из dataset_1.js
import { data } from "./data/dataset_1.js";

export function initData() {
    // переменные для кеширования данных
    let sellers;
    let customers;
    let purchaseRecords;
    let lastResult;
    let lastQuery;

    // функция для приведения строк в тот вид, который нужен нашей таблице
    const mapRecords = (records) => records.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id] ? `${sellers[item.seller_id].first_name} ${sellers[item.seller_id].last_name}` : '',
        customer: customers[item.customer_id] ? `${customers[item.customer_id].first_name} ${customers[item.customer_id].last_name}` : '',
        total: item.total_amount
    }));

    // функция получения индексов (продавцов и покупателей из данных)
    const getIndexes = async () => {
        // Преобразуем массив продавцов в объект с ключами по id
        sellers = data.sellers.reduce((acc, seller) => {
            acc[seller.id] = seller;
            return acc;
        }, {});
        
        // Преобразуем массив покупателей в объект с ключами по id
        customers = data.customers.reduce((acc, customer) => {
            acc[customer.id] = customer;
            return acc;
        }, {});
        
        // Сохраняем записи о покупках
        purchaseRecords = data.purchase_records;

        return { sellers, customers };
    }

    // функция получения записей о продажах с фильтрацией и пагинацией
    const getRecords = async (query, isUpdated = false) => {
        // Если индексы еще не загружены, загружаем их
        if (!sellers || !customers) {
            await getIndexes();
        }

        // Создаем строку запроса для кеширования
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        console.log('=== getRecords called ===');
        console.log('Query:', query);
        console.log('Query string:', nextQuery);

        // Проверяем кеш
        if (lastQuery === nextQuery && !isUpdated) {
            console.log('Returning cached result');
            return lastResult;
        }

        // Копируем все записи
        let records = [...purchaseRecords];
        console.log('Initial records count:', records.length);

        // Применяем фильтрацию
        // Фильтр по дате - точное совпадение
        if (query['filter[date]']) {
            const dateFilter = query['filter[date]'].trim();
            console.log('Filtering by date:', dateFilter);
            records = records.filter(record => record.date === dateFilter);
            console.log('After date filter:', records.length);
        }

        // Фильтр по покупателю - поиск по полному имени (содержит подстроку)
        if (query['filter[customer]']) {
            const customerFilter = query['filter[customer]'].trim().toLowerCase();
            console.log('Filtering by customer:', customerFilter);
            records = records.filter(record => {
                const customer = customers[record.customer_id];
                if (!customer) return false;
                const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
                return fullName.includes(customerFilter);
            });
            console.log('After customer filter:', records.length);
        }

        // Фильтр по продавцу - точное совпадение по id
        if (query['filter[seller]']) {
            const sellerId = query['filter[seller]'];
            console.log('Filtering by seller ID:', sellerId);
            // Проверяем, что sellerId не пустая строка и не "all"
            if (sellerId && sellerId !== '' && sellerId !== 'all') {
                records = records.filter(record => record.seller_id === sellerId);
                console.log('After seller filter:', records.length);
            }
        }

        // Фильтр по сумме от
        if (query['filter[totalFrom]']) {
            const from = parseFloat(query['filter[totalFrom]']);
            console.log('Filtering by total from:', from);
            if (!isNaN(from)) {
                records = records.filter(record => record.total_amount >= from);
                console.log('After total from filter:', records.length);
            }
        }

        // Фильтр по сумме до
        if (query['filter[totalTo]']) {
            const to = parseFloat(query['filter[totalTo]']);
            console.log('Filtering by total to:', to);
            if (!isNaN(to)) {
                records = records.filter(record => record.total_amount <= to);
                console.log('After total to filter:', records.length);
            }
        }

        // Поиск по всем полям
        if (query.search) {
            const searchTerm = query.search.trim().toLowerCase();
            console.log('Searching for:', searchTerm);
            records = records.filter(record => {
                const date = record.date || '';
                const customer = customers[record.customer_id];
                const customerName = customer ? `${customer.first_name} ${customer.last_name}` : '';
                const seller = sellers[record.seller_id];
                const sellerName = seller ? `${seller.first_name} ${seller.last_name}` : '';
                const total = String(record.total_amount || '');
                
                return date.includes(searchTerm) ||
                       customerName.toLowerCase().includes(searchTerm) ||
                       sellerName.toLowerCase().includes(searchTerm) ||
                       total.includes(searchTerm);
            });
            console.log('After search filter:', records.length);
        }

        // Сортировка
        if (query.sort) {
            const [field, order] = query.sort.split(':');
            const sortOrder = order === 'down' ? -1 : 1;
            
            console.log('Sorting by:', field, 'order:', order);
            records.sort((a, b) => {
                let aVal, bVal;
                
                if (field === 'date') {
                    aVal = new Date(a.date);
                    bVal = new Date(b.date);
                } else if (field === 'total') {
                    aVal = a.total_amount;
                    bVal = b.total_amount;
                } else {
                    return 0;
                }
                
                if (aVal < bVal) return -1 * sortOrder;
                if (aVal > bVal) return 1 * sortOrder;
                return 0;
            });
        }

        // Сохраняем общее количество до пагинации
        const total = records.length;
        console.log('Total records after all filters:', total);

        // Пагинация
        const limit = parseInt(query.limit) || 10;
        const page = parseInt(query.page) || 1;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedRecords = records.slice(start, end);
        console.log('Paginated records count:', paginatedRecords.length);

        // Формируем результат
        lastQuery = nextQuery;
        lastResult = {
            total: total,
            items: mapRecords(paginatedRecords)
        };

        console.log('Returning result with items:', lastResult.items.length);
        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}