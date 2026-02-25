import requests
import json
from datetime import datetime

# --- CONFIGURATION ---
API_KEY = 'e5e2f519197fc127490f4472b11616e7'
SPORT = 'basketball_nba'
BOOKMAKER = 'fanduel'
# On demande les 3 marchés principaux de joueurs d'un coup
MARKETS = 'player_points,player_rebounds,player_assists' 
REGIONS = 'us'
ODDS_FORMAT = 'decimal'

def fetch_all_nba_data():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Début de la synchronisation...")
    
    # 1. Récupérer la liste des matchs d'aujourd'hui
    events_url = f'https://api.the-odds-api.com/v4/sports/{SPORT}/events?apiKey={API_KEY}'
    events_res = requests.get(events_url)
    
    if events_res.status_code != 200:
        print(f"Erreur lors de la récupération des matchs: {events_res.status_code}")
        return

    events = events_res.json()
    final_data = {
        "last_updated": datetime.now().isoformat(),
        "games": []
    }

    # 2. Pour chaque match, récupérer toutes les cotes (Match + Joueurs)
    for event in events:
        event_id = event['id']
        print(f"Traitement : {event['away_team']} @ {event['home_team']}...")

        # Requête pour obtenir les props chez FanDuel pour ce match précis
        odds_url = f'https://api.the-odds-api.com/v4/sports/{SPORT}/events/{event_id}/odds?apiKey={API_KEY}&regions={REGIONS}&markets={MARKETS}&bookmakers={BOOKMAKER}&oddsFormat={ODDS_FORMAT}'
        odds_res = requests.get(odds_url)
        
        if odds_res.status_code != 200:
            print(f"Erreur pour le match {event_id}")
            continue

        data = odds_res.json()
        
        # Structure pour stocker les infos de ce match
        game_info = {
            "id": event_id,
            "home_team": event['home_team'],
            "away_team": event['away_team'],
            "commence_time": event['commence_time'],
            "players": {}
        }

        # 3. Extraction et organisation des paliers par joueur
        if 'bookmakers' in data and len(data['bookmakers']) > 0:
            markets = data['bookmakers'][0]['markets']
            
            for market in markets:
                market_key = market['key'] # ex: player_points
                
                for outcome in market['outcomes']:
                    player_name = outcome['description']
                    
                    # On crée le joueur dans notre dictionnaire s'il n'existe pas
                    if player_name not in game_info['players']:
                        game_info['players'][player_name] = {
                            "points": [],
                            "rebounds": [],
                            "assists": []
                        }
                    
                    # On nettoie le nom du marché pour le stockage (ex: player_points -> points)
                    clean_market = market_key.replace('player_', '')
                    
                    # On ajoute le palier (threshold) et la cote
                    # Note : FanDuel donne souvent le seuil dans 'point'
                    game_info['players'][player_name][clean_market].append({
                        "threshold": outcome.get('point'),
                        "odds": outcome.get('price')
                    })

        final_data["games"].append(game_info)

    # 4. Sauvegarde dans le fichier JSON
    with open('nba_data.json', 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=4, ensure_ascii=False)
    
    print(f"\nTerminé ! Le fichier 'nba_data.json' est prêt.")

if __name__ == "__main__":
    fetch_all_nba_data()