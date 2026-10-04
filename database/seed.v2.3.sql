-- Shahebbazar seed v2.3: sample payment methods. padma-garden-tours is left empty on purpose.

BEGIN;

INSERT INTO vendor_payment_methods (vendor_id, payment_method, payment_note, payment_sort_order)
SELECT v.vendor_id, p.method, p.note, p.sort
FROM (VALUES
    ('shaheb-bazar-silk-house',  'cash',             NULL,                                   0),
    ('shaheb-bazar-silk-house',  'bkash',            NULL,                                   1),
    ('shaheb-bazar-silk-house',  'bank_transfer',    'Wholesale orders',                     2),
    ('shaheb-bazar-silk-house',  'cash_on_delivery', 'Within Rajshahi city',                 3),

    ('padma-handicrafts',        'cash',             NULL,                                   0),
    ('padma-handicrafts',        'bkash',            NULL,                                   1),
    ('padma-handicrafts',        'bank_transfer',    'Export and bulk orders',               2),

    ('barind-agro-supplies',     'cash',             NULL,                                   0),
    ('barind-agro-supplies',     'bank_transfer',    'Co-operative accounts',                1),
    ('barind-agro-supplies',     'nagad',            NULL,                                   2),

    ('rajshahi-mango-traders',   'cash_on_delivery', 'Courier delivery nationwide',          0),
    ('rajshahi-mango-traders',   'bkash',            'Advance for orders outside Rajshahi',  1),
    ('rajshahi-mango-traders',   'bank_transfer',    NULL,                                   2),

    ('uttara-light-engineering', 'cash',             NULL,                                   0),
    ('uttara-light-engineering', 'bank_transfer',    'Job work above 20,000 BDT',            1),

    ('green-life-pharmacy',      'cash',             NULL,                                   0),
    ('green-life-pharmacy',      'bkash',            NULL,                                   1),
    ('green-life-pharmacy',      'nagad',            NULL,                                   2),
    ('green-life-pharmacy',      'cash_on_delivery', 'Home delivery within the city',        3),

    ('padma-diagnostic-centre',  'cash',             NULL,                                   0),
    ('padma-diagnostic-centre',  'card',             NULL,                                   1),
    ('padma-diagnostic-centre',  'bkash',            NULL,                                   2),

    ('rajshahi-medical-centre',  'cash',             NULL,                                   0),
    ('rajshahi-medical-centre',  'card',             'At the billing counter',               1),
    ('rajshahi-medical-centre',  'bkash',            NULL,                                   2),
    ('rajshahi-medical-centre',  'nagad',            NULL,                                   3),

    ('padma-view-restaurant',    'cash',             NULL,                                   0),
    ('padma-view-restaurant',    'card',             NULL,                                   1),
    ('padma-view-restaurant',    'bkash',            NULL,                                   2),

    ('grand-river-view-hotel',   'cash',             NULL,                                   0),
    ('grand-river-view-hotel',   'card',             NULL,                                   1),
    ('grand-river-view-hotel',   'bank_transfer',    'Group and corporate bookings',         2),

    ('rajshahi-craft-outlet',    'cash',             NULL,                                   0),
    ('rajshahi-craft-outlet',    'bkash',            NULL,                                   1),
    ('rajshahi-craft-outlet',    'rocket',           NULL,                                   2),

    ('digitax-accounting',       'bank_transfer',    NULL,                                   0),
    ('digitax-accounting',       'bkash',            NULL,                                   1)
) AS p(slug, method, note, sort)
JOIN vendors v ON v.vendor_slug = p.slug
ON CONFLICT (vendor_id, payment_method) DO NOTHING;

COMMIT;
