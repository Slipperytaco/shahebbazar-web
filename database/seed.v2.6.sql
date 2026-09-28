-- Demo data for saved businesses, messaging, alerts and review replies.

INSERT INTO saved_businesses (user_id, vendor_id)
SELECT u.user_id, v.vendor_id
FROM users u
JOIN vendors v ON v.vendor_slug IN ('shaheb-bazar-silk-house', 'green-life-pharmacy')
WHERE u.user_phone = '+8801722000001';

INSERT INTO conversations (vendor_id, user_id, listing_id, conversation_last_message_at)
SELECT v.vendor_id, u.user_id, l.listing_id, NOW() - INTERVAL '1 hour'
FROM vendors v
JOIN users u ON u.user_phone = '+8801722000001'
JOIN vendor_listings l ON l.vendor_id = v.vendor_id AND l.listing_title = 'Katan Silk Saree'
WHERE v.vendor_slug = 'shaheb-bazar-silk-house';

INSERT INTO messages (conversation_id, sender_user_id, message_body, message_read_at, message_created_at)
SELECT c.conversation_id, m.sender, m.body, m.read_at, m.sent_at
FROM conversations c
JOIN vendors v ON v.vendor_id = c.vendor_id AND v.vendor_slug = 'shaheb-bazar-silk-house'
CROSS JOIN LATERAL (VALUES
    (c.user_id, 'Do you have the katan saree in maroon? I need two for a wedding next month.',
     NOW() - INTERVAL '2 hours', NOW() - INTERVAL '3 hours'),
    (v.user_id, 'Yes, we have maroon in stock. Two sarees can be ready in a week. Would you like to visit the shop?',
     NULL::timestamptz, NOW() - INTERVAL '1 hour')
) AS m(sender, body, read_at, sent_at);

INSERT INTO notifications (user_id, notification_type, notification_channel, notification_payload,
                           notification_status, notification_sent_at, notification_read_at)
SELECT c.user_id, 'message.new', 'in_app',
       jsonb_build_object('conversation_id', c.conversation_id, 'from', v.vendor_name,
                          'preview', 'Yes, we have maroon in stock.'),
       'sent', NOW() - INTERVAL '1 hour', NULL
FROM conversations c
JOIN vendors v ON v.vendor_id = c.vendor_id AND v.vendor_slug = 'shaheb-bazar-silk-house';

UPDATE reviews r
SET review_reply = 'Thank you for visiting! We are glad the katan saree was what you were looking for.',
    review_replied_at = NOW() - INTERVAL '2 days'
FROM vendors v, users u
WHERE v.vendor_id = r.vendor_id AND v.vendor_slug = 'shaheb-bazar-silk-house'
  AND u.user_id = r.user_id AND u.user_phone = '+8801722000001';
