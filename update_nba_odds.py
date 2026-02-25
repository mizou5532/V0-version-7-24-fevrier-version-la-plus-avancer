import requests
import json
from datetime import datetime

# --- CONFIGURATION ---
API_KEY = 'e5e2f519197fc127490f4472b11616e7'
SPORT = 'basketball_nba'
BOOKMAKER = 'fanduel'
# AJOUT : 'h2h' pour les cotes d'équipe
MARKETS = 'h2h,player_points,player_rebounds,player_assists' 
REGIONS = 'us'
ODDS_FORMAT = 'decimal'

def fetch_all_nba_data():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Début de la synchronisation complète...")
    
    events_url = f'https://api.the-odds-api.com/v4/sports/{SPORT}/events?apiKey={API_KEY}'
    events_res = requests.get(events_url)
    
    if events_res.status_code != 200:
        print(f"Erreur API: {events_res.status_code}")
        return

    events = events_res.json()
    final_data = {"last_updated": datetime.now().isoformat(), "games": []}

    for event in events:
        event_id = event['id']
        print(f"Récupération des cotes : {event['away_team']} @ {event['home_team']}...")

        odds_url = f'https://api.the-odds-api.com/v4/sports/{SPORT}/events/{event_id}/odds?apiKey={API_KEY}&regions={REGIONS}&markets={MARKETS}&bookmakers={BOOKMAKER}&oddsFormat={ODDS_FORMAT}'
        odds_res = requests.get(odds_url)
        
        if odds_res.status_code != 200: continue

        data = odds_res.json()
        game_info = {
            "id": event_id,
            "home_team": event['home_team'],
            "away_team": event['away_team'],
            "commence_time": event['commence_time'],
            "team_odds": {}, # NOUVEAU : Pour stocker les cotes de victoire
            "players": {}
        }

        if 'bookmakers' in data and len(data['bookmakers']) > 0:
            markets = data['bookmakers'][0]['markets']
            
            for market in markets:
                # CAS 1 : Cotes de victoire de l'équipe (h2h)
                if market['key'] == 'h2h':
                    for outcome in market['outcomes']:
                        game_info["team_odds"][outcome['name']] = outcome['price']
                
                # CAS 2 : Cotes des joueurs
                elif market['key'].startswith('player_'):
                    market_name = market['key'].replace('player_', '')
                    for outcome in market['outcomes']:
                        player = outcome['description']
                        if player not in game_info['players']:
                            game_info['players'][player] = {"points": [], "rebounds": [], "assists": []}
                        
                        game_info['players'][player][market_name].append({
                            "threshold": outcome.get('point'),
                            "odds": outcome.get('price')
                        })

        final_data["games"].append(game_info)

    with open('nba_data.json', 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=4, ensure_ascii=False)
    
    print(f"\nSuccès ! 'nba_data.json' contient maintenant les cotes d'équipes et de joueurs.")

if __name__ == "__main__":
    fetch_all_nba_data()