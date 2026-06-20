<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Seed Admin User
        \App\Models\User::factory()->create([
            'name' => 'Administrator',
            'email' => 'admin@mart2500.com',
            'password' => bcrypt('password'),
        ]);

        // 1. Seed Exchange Rate
        \App\Models\ExchangeRate::create([
            'usd_to_khr' => 4000,
        ]);

        // 2. Seed Default Categories
        $categories = [
            'Drinks', 'Energy Drinks', 'Water',
            'Beer & Alcohol', 'Snacks', 'Noodles & Food',
            'Cigarettes', 'Candy & Sweets', 'General',
        ];
        foreach ($categories as $i => $name) {
            \App\Models\Category::create(['name' => $name, 'sort_order' => $i]);
        }

        // 2. Seed 5 Mock Customers
        $customers = [
            ['name' => 'Sokha', 'phone_number' => '012345678', 'total_debt_balance' => 0, 'total_lifetime_spent' => 0],
            ['name' => 'Dara', 'phone_number' => '098765432', 'total_debt_balance' => 15000, 'total_lifetime_spent' => 45000],
            ['name' => 'Bopha', 'phone_number' => '011223344', 'total_debt_balance' => 0, 'total_lifetime_spent' => 120000],
            ['name' => 'Chetra', 'phone_number' => '077889900', 'total_debt_balance' => -5000, 'total_lifetime_spent' => 80000], // Has 5000 store credit
            ['name' => 'Vannak', 'phone_number' => '069112233', 'total_debt_balance' => 50000, 'total_lifetime_spent' => 50000],
        ];

        foreach ($customers as $customer) {
            \App\Models\Customer::create($customer);
        }

        // 3. Seed 20 Mock Items with images
        $items = [
            ['name' => 'Coca Cola 330ml',         'default_cost' => 1800, 'default_price' => 2500,  'category' => 'Drinks', 'image_path' => 'items/coca-cola-330ml.jpg'],
            ['name' => 'Pepsi 330ml',              'default_cost' => 1800, 'default_price' => 2500,  'category' => 'Drinks', 'image_path' => 'items/pepsi-330ml.jpg'],
            ['name' => 'Oishi Green Tea',          'default_cost' => 1800, 'default_price' => 2500,  'category' => 'Drinks', 'image_path' => 'items/oishi-green-tea.jpg'],
            ['name' => 'Nescafe Iced Coffee',      'default_cost' => 2500, 'default_price' => 3500,  'category' => 'Drinks', 'image_path' => 'items/nescafe-iced-coffee.jpg'],
            ['name' => 'Sting Energy Drink',       'default_cost' => 2000, 'default_price' => 3000,  'category' => 'Energy Drinks', 'image_path' => 'items/sting-energy.jpg'],
            ['name' => 'Bacchus Energy',           'default_cost' => 2200, 'default_price' => 3500,  'category' => 'Energy Drinks', 'image_path' => 'items/bacchus-energy.jpg'],
            ['name' => 'Sponsor Active',           'default_cost' => 2000, 'default_price' => 3000,  'category' => 'Energy Drinks', 'image_path' => 'items/sponsor-active.jpg'],
            ['name' => 'Dasani Water 500ml',       'default_cost' => 600,  'default_price' => 1000,  'category' => 'Water', 'image_path' => 'items/dasani-water-500ml.jpg'],
            ['name' => 'Vital Water 500ml',        'default_cost' => 700,  'default_price' => 1000,  'category' => 'Water', 'image_path' => 'items/vital-water-500ml.jpg'],
            ['name' => 'Kulen Mineral Water 500ml','default_cost' => 1000, 'default_price' => 1500,  'category' => 'Water', 'image_path' => 'items/kulen-mineral-water-500ml.jpg'],
            ['name' => 'Angkor Beer Can',          'default_cost' => 2200, 'default_price' => 3000,  'category' => 'Beer & Alcohol', 'image_path' => 'items/angkor-beer.jpg'],
            ['name' => 'Hanuman Beer Can',         'default_cost' => 2500, 'default_price' => 3500,  'category' => 'Beer & Alcohol', 'image_path' => 'items/hanuman-beer.jpg'],
            ['name' => 'ABC Stout Can',            'default_cost' => 4500, 'default_price' => 6000,  'category' => 'Beer & Alcohol', 'image_path' => 'items/abc-stout.jpg'],
            ['name' => 'Lay\'s Classic Potato Chips','default_cost' => 3000,'default_price' => 4500, 'category' => 'Snacks', 'image_path' => 'items/lays-potato-chips.jpg'],
            ['name' => 'Chupa Chups Lolly',        'default_cost' => 200,  'default_price' => 500,   'category' => 'Candy & Sweets', 'image_path' => 'items/chupa-chups-lolly.jpg'],
            ['name' => 'Mentos Mint',              'default_cost' => 1200, 'default_price' => 2000,  'category' => 'Candy & Sweets', 'image_path' => 'items/mentos-mint.jpg'],
            ['name' => 'MAMA Noodle Pork',         'default_cost' => 800,  'default_price' => 1500,  'category' => 'Noodles & Food', 'image_path' => 'items/mama-noodle.jpg'],
            ['name' => 'Mee Chiet Beef',           'default_cost' => 900,  'default_price' => 1500,  'category' => 'Noodles & Food', 'image_path' => 'items/mee-chiet-beef.jpg'],
            ['name' => 'Marlboro Gold',            'default_cost' => 5500, 'default_price' => 7000,  'category' => 'Cigarettes', 'image_path' => 'items/marlboro-gold.jpg'],
            ['name' => 'Esse Change',              'default_cost' => 5000, 'default_price' => 6500,  'category' => 'Cigarettes', 'image_path' => 'items/esse-change.jpg'],
        ];

        foreach ($items as $item) {
            \App\Models\Item::create($item);
        }

        // 4. Seed 15 Sample Invoices with items
        $invoiceData = [
            // Sokha - 3 invoices
            [
                'invoice_number' => 'INV-20260401-0001',
                'customer_id' => 1, // Sokha
                'payment_method' => 'cash',
                'status' => 'Completed',
                'created_at' => now()->subDays(7),
                'items' => [
                    ['item_name' => 'Coca Cola 330ml', 'qty' => 2, 'price' => 2500],
                    ['item_name' => 'Pepsi 330ml', 'qty' => 1, 'price' => 2500],
                    ['item_name' => 'Lay\'s Classic Potato Chips', 'qty' => 1, 'price' => 4500],
                ]
            ],
            [
                'invoice_number' => 'INV-20260402-0002',
                'customer_id' => 1, // Sokha
                'payment_method' => 'cash',
                'status' => 'Completed',
                'created_at' => now()->subDays(6),
                'items' => [
                    ['item_name' => 'Sting Energy Drink', 'qty' => 3, 'price' => 3000],
                    ['item_name' => 'Oishi Green Tea', 'qty' => 2, 'price' => 2500],
                ]
            ],
            [
                'invoice_number' => 'INV-20260403-0003',
                'customer_id' => 1, // Sokha
                'payment_method' => 'cash',
                'status' => 'Completed',
                'created_at' => now()->subDays(5),
                'items' => [
                    ['item_name' => 'Angkor Beer Can', 'qty' => 6, 'price' => 3000],
                    ['item_name' => 'Mentos Mint', 'qty' => 4, 'price' => 2000],
                ]
            ],
            // Dara - 3 invoices
            [
                'invoice_number' => 'INV-20260404-0004',
                'customer_id' => 2, // Dara
                'payment_method' => 'card',
                'status' => 'Completed',
                'created_at' => now()->subDays(4),
                'items' => [
                    ['item_name' => 'Nescafe Iced Coffee', 'qty' => 2, 'price' => 3500],
                    ['item_name' => 'Dasani Water 500ml', 'qty' => 4, 'price' => 1000],
                ]
            ],
            [
                'invoice_number' => 'INV-20260405-0005',
                'customer_id' => 2, // Dara
                'payment_method' => 'cash',
                'status' => 'Completed',
                'created_at' => now()->subDays(3),
                'items' => [
                    ['item_name' => 'MAMA Noodle Pork', 'qty' => 5, 'price' => 1500],
                    ['item_name' => 'Chupa Chups Lolly', 'qty' => 10, 'price' => 500],
                ]
            ],
            [
                'invoice_number' => 'INV-20260406-0006',
                'customer_id' => 2, // Dara
                'payment_method' => 'card',
                'status' => 'Completed',
                'created_at' => now()->subDays(2),
                'items' => [
                    ['item_name' => 'Bacchus Energy', 'qty' => 2, 'price' => 3500],
                    ['item_name' => 'Oishi Green Tea', 'qty' => 1, 'price' => 2500],
                ]
            ],
            // Bopha - 3 invoices
            [
                'invoice_number' => 'INV-20260407-0007',
                'customer_id' => 3, // Bopha
                'payment_method' => 'cash',
                'status' => 'Completed',
                'created_at' => now()->subDays(1),
                'items' => [
                    ['item_name' => 'Marlboro Gold', 'qty' => 2, 'price' => 7000],
                    ['item_name' => 'Coca Cola 330ml', 'qty' => 5, 'price' => 2500],
                ]
            ],
            [
                'invoice_number' => 'INV-20260408-0008',
                'customer_id' => 3, // Bopha
                'payment_method' => 'cash',
                'status' => 'Completed',
                'created_at' => now(),
                'items' => [
                    ['item_name' => 'ABC Stout Can', 'qty' => 3, 'price' => 6000],
                    ['item_name' => 'Mee Chiet Beef', 'qty' => 2, 'price' => 1500],
                ]
            ],
            [
                'invoice_number' => 'INV-20260409-0009',
                'customer_id' => 3, // Bopha
                'payment_method' => 'card',
                'status' => 'Completed',
                'created_at' => now(),
                'items' => [
                    ['item_name' => 'Sponsor Active', 'qty' => 4, 'price' => 3000],
                    ['item_name' => 'Vital Water 500ml', 'qty' => 6, 'price' => 1000],
                ]
            ],
            // Chetra - 3 invoices
            [
                'invoice_number' => 'INV-20260410-0010',
                'customer_id' => 4, // Chetra
                'payment_method' => 'cash',
                'status' => 'Completed',
                'created_at' => now(),
                'items' => [
                    ['item_name' => 'Hanuman Beer Can', 'qty' => 4, 'price' => 3500],
                    ['item_name' => 'Kulen Mineral Water 500ml', 'qty' => 2, 'price' => 1500],
                ]
            ],
            [
                'invoice_number' => 'INV-20260411-0011',
                'customer_id' => 4, // Chetra
                'payment_method' => 'card',
                'status' => 'Completed',
                'created_at' => now(),
                'items' => [
                    ['item_name' => 'Esse Change', 'qty' => 1, 'price' => 6500],
                    ['item_name' => 'Nescafe Iced Coffee', 'qty' => 3, 'price' => 3500],
                ]
            ],
            [
                'invoice_number' => 'INV-20260412-0012',
                'customer_id' => 4, // Chetra
                'payment_method' => 'cash',
                'status' => 'Completed',
                'created_at' => now(),
                'items' => [
                    ['item_name' => 'Pepsi 330ml', 'qty' => 3, 'price' => 2500],
                    ['item_name' => 'Mentos Mint', 'qty' => 2, 'price' => 2000],
                ]
            ],
            // Vannak - 3 invoices
            [
                'invoice_number' => 'INV-20260413-0013',
                'customer_id' => 5, // Vannak
                'payment_method' => 'cash',
                'status' => 'Completed',
                'created_at' => now(),
                'items' => [
                    ['item_name' => 'Sting Energy Drink', 'qty' => 2, 'price' => 3000],
                    ['item_name' => 'Lay\'s Classic Potato Chips', 'qty' => 2, 'price' => 4500],
                ]
            ],
            [
                'invoice_number' => 'INV-20260414-0014',
                'customer_id' => 5, // Vannak
                'payment_method' => 'card',
                'status' => 'Completed',
                'created_at' => now(),
                'items' => [
                    ['item_name' => 'Coca Cola 330ml', 'qty' => 1, 'price' => 2500],
                    ['item_name' => 'Bacchus Energy', 'qty' => 1, 'price' => 3500],
                    ['item_name' => 'MAMA Noodle Pork', 'qty' => 3, 'price' => 1500],
                ]
            ],
            [
                'invoice_number' => 'INV-20260415-0015',
                'customer_id' => 5, // Vannak
                'payment_method' => 'cash',
                'status' => 'Completed',
                'created_at' => now(),
                'items' => [
                    ['item_name' => 'Angkor Beer Can', 'qty' => 5, 'price' => 3000],
                    ['item_name' => 'Chupa Chups Lolly', 'qty' => 5, 'price' => 500],
                ]
            ],
        ];

        // Create invoices and their items
        foreach ($invoiceData as $data) {
            $items = $data['items'];
            unset($data['items']);

            // Calculate total from items
            $total = 0;
            foreach ($items as $item) {
                $total += $item['qty'] * $item['price'];
            }

            $invoice = \App\Models\Invoice::create([
                'invoice_number' => $data['invoice_number'],
                'customer_id' => $data['customer_id'],
                'total_khr' => $total,
                'payment_method' => $data['payment_method'],
                'status' => $data['status'],
                'payment_provider' => null,
                'created_at' => $data['created_at'],
                'updated_at' => $data['created_at'],
            ]);

            // Create invoice items
            foreach ($items as $item) {
                \App\Models\InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'item_name' => $item['item_name'],
                    'qty' => $item['qty'],
                    'custom_price_sold_at' => $item['price'],
                ]);
            }
        }
    }
}
