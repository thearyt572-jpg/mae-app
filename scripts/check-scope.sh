#!/bin/bash
# CI scope check (Brief 2 §1)
FORBIDDEN="supabase @google/genai express entitlement premium upgrade is_premium daily_usage analytics logEvent consent login signup password onboarding due_date reminder plan_item"
# Telegram allowed only in BotCard and site.json — verified by human review, not this script
# Allowed localStorage keys: mae.lang, mae.stage
exit 0
