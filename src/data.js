const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    const mapRecords = (data) => {
        return data.map(item => ({
            id: item.receipt_id,
            date: item.date,
            seller: sellers[item.seller_id] || item.seller_id,
            customer: customers[item.customer_id] || item.customer_id,
            total: item.total_amount
        }));
    };

    const getIndexes = async () => {
        if (!sellers || !customers) {
            try {
                const [sellersResponse, customersResponse] = await Promise.all([
                    fetch(`${BASE_URL}/sellers`),
                    fetch(`${BASE_URL}/customers`)
                ]);
                
                sellers = await sellersResponse.json();
                customers = await customersResponse.json();
                
                console.log('Sellers loaded:', sellers);
                console.log('Customers loaded:', customers);
            } catch (error) {
                console.error('Error fetching indexes:', error);
                const { data } = await import('./data/dataset_1.js');
                sellers = data.sellers.reduce((acc, seller) => {
                    acc[seller.id] = `${seller.first_name} ${seller.last_name}`;
                    return acc;
                }, {});
                customers = data.customers.reduce((acc, customer) => {
                    acc[customer.id] = `${customer.first_name} ${customer.last_name}`;
                    return acc;
                }, {});
            }
        }

        return { sellers, customers };
    }

    const getRecords = async (query, isUpdated = false) => {
        if (!sellers || !customers) {
            await getIndexes();
        }

        const cleanQuery = {};
        Object.keys(query).forEach(key => {
            const value = query[key];
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                cleanQuery[key] = value;
            }
        });

        const qs = new URLSearchParams(cleanQuery);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        try {
            const url = `${BASE_URL}/records?${nextQuery}`;
            console.log('Fetching:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
                console.error('Response status:', response.status);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const records = await response.json();

            lastQuery = nextQuery;
            lastResult = {
                total: records.total || 0,
                items: mapRecords(records.items || [])
            };
            
            return lastResult;
        } catch (error) {
            console.error('Error fetching records:', error);
            return {
                total: 0,
                items: []
            };
        }
    };

    return {
        getIndexes,
        getRecords
    };
}