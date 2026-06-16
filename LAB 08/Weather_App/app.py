import os
from dotenv import load_dotenv
from flask import Flask, render_template, request
import requests
import datetime
import time

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- Configuration ---
# Use the API_KEY or OPENWEATHER_API_KEY from .env
WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY") or os.getenv("API_KEY") 
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

# Function to convert Celsius to Fahrenheit
def c_to_f(celsius):
    return round((celsius * 9/5) + 32)

# Function to determine if it is night time in the requested location
def check_day_night(dt_utc, sunrise_utc, sunset_utc):
    """Checks if the current time is outside of sunrise and sunset times (i.e., night)."""
    # All times are Unix timestamps (UTC)
    return dt_utc < sunrise_utc or dt_utc > sunset_utc

# Function to convert visibility from meters to kilometers
def convert_visibility_to_km(visibility_m):
    """Converts visibility from meters to kilometers (with one decimal place)."""
    if isinstance(visibility_m, int) or isinstance(visibility_m, float):
        return round(visibility_m / 1000, 1)
    return 'N/A'

# NEW: Function to calculate and format the local time of the searched city
def calculate_local_time(dt_utc, timezone_offset):
    """
    Calculates the local date and time for the city using the UTC data point (dt)
    and the timezone offset (seconds from UTC) provided by OpenWeatherMap.
    """
    try:
        # Create a datetime object using the UTC timestamp
        utc_time = datetime.datetime.fromtimestamp(dt_utc, tz=datetime.timezone.utc)
        
        # Apply the timezone offset (in seconds)
        local_tz = datetime.timezone(datetime.timedelta(seconds=timezone_offset))
        local_time = utc_time.astimezone(local_tz)
        
        # Format the time as requested: Day, Month Date, Year, Hour:Minute AM/PM
        # Example: Sat, Nov 30, 2025, 12:08 AM
        return local_time.strftime('%a, %b %d, %Y, %I:%M %p')
    except Exception:
        return "Time Data N/A"


@app.route('/', methods=['GET', 'POST'])
def index():
    """
    Renders the main page and handles city submission via POST, applying dynamic background logic.
    """
    # Default unit is metric (Celsius)
    current_unit = request.form.get('unit', 'metric') 

    if request.method == 'POST':
        city = request.form.get('city')
        
        if not city:
            return render_template('index.html', error="Please enter a city name.", current_unit=current_unit)

        params = {
            'q': city,
            'appid': WEATHER_API_KEY,
            'units': 'metric' # Always fetch metric, then convert if needed, to calculate both C/F
        }
        
        try:
            if not WEATHER_API_KEY or WEATHER_API_KEY == "YOUR_OPENWEATHER_API_KEY_HERE":
                 return render_template('index.html', error="API Key is missing or default. Check your .env file.", current_unit=current_unit)

            response = requests.get(WEATHER_API_URL, params=params)
            response.raise_for_status() 
            
            weather_data = response.json()
            
            if weather_data.get('cod') == 200:
                # Get temps in Celsius
                temp_c = round(weather_data['main']['temp'])
                feels_like_c = round(weather_data['main']['feels_like'])
                
                # Convert to Fahrenheit
                temp_f = c_to_f(temp_c)
                feels_like_f = c_to_f(feels_like_c)

                # Determine wind speed units based on initial request (M/S or MPH)
                wind_speed_ms = weather_data['wind']['speed']
                wind_speed_mph = round(wind_speed_ms * 2.23694, 1) # Conversion from m/s to mph

                # --- Dynamic Logic for Background/Effects ---
                is_night = check_day_night(
                    weather_data['dt'], 
                    weather_data['sys']['sunrise'], 
                    weather_data['sys']['sunset']
                )
                weather_condition = weather_data['weather'][0]['main'] # e.g., 'Rain', 'Snow', 'Clear', 'Clouds'
                
                # Check for cold temperature (below 10°C or 50°F)
                temp_threshold_c = 10
                is_cold = temp_c < temp_threshold_c
                
                # --- Local Time Calculation ---
                city_local_datetime = calculate_local_time(
                    weather_data['dt'],
                    weather_data['timezone'] # Timezone offset in seconds
                )
                
                # Extract all necessary data
                weather_info = {
                    'city': weather_data['name'],
                    'country': weather_data['sys']['country'],
                    
                    # TIME: Local time of the city searched
                    'city_local_datetime': city_local_datetime,
                    
                    # NEW: Primary temp for large display (e.g., "25°C")
                    'temp_primary': f"{temp_c}°C",

                    # Combined Temperature Strings (e.g., "25°C / 77°F")
                    'temp': f"{temp_c}°C / {temp_f}°F",
                    'feels_like': f"{feels_like_c}°C / {feels_like_f}°F",

                    'description': weather_data['weather'][0]['description'].capitalize(),
                    'icon': weather_data['weather'][0]['icon'],
                    'humidity': weather_data['main']['humidity'],
                    'pressure': weather_data['main']['pressure'], 
                    'visibility': convert_visibility_to_km(weather_data.get('visibility', 'N/A')),
                    # Combined Wind Speed String
                    'wind_speed': f"{wind_speed_ms:.1f} m/s / {wind_speed_mph:.1f} mph",
                    
                    # Pass dynamic variables to the template
                    'is_night': is_night,
                    'weather_condition': weather_condition,
                    'is_cold': is_cold 
                }
                
                return render_template('index.html', weather=weather_info, current_unit=current_unit, is_result_page=True)
            else:
                return render_template('index.html', error=f"City '{city}' not found.", current_unit=current_unit)

        except requests.exceptions.HTTPError as http_err:
            if response.status_code == 401:
                error_msg = "Invalid API Key (401). Please check your OPENWEATHER_API_KEY in the .env file."
            elif response.status_code == 404:
                error_msg = f"City '{city}' not found."
            else:
                error_msg = f"HTTP Error: {http_err}"
            return render_template('index.html', error=error_msg, current_unit=current_unit)
        
        except requests.exceptions.RequestException as e:
            print(f"API Request Error: {e}")
            return render_template('index.html', error="Could not connect to the weather service.", current_unit=current_unit)

    # Render the initial form page (GET request)
    return render_template('index.html', current_unit=current_unit, is_result_page=False)

if __name__ == '__main__':
    app.run(debug=True)