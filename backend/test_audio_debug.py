"""
Script de diagnóstico para verificar qué está fallando
"""
import os
import sys
import librosa
import numpy as np

# Ajustar paths
ROOT = os.path.dirname(__file__) or "."
sys.path.append(ROOT)

from utils.feature_extractor import FeatureExtractor

# Buscar un archivo de audio de prueba
test_audio = None
for root, dirs, files in os.walk(os.path.join(ROOT, "data", "public_datasets", "RAVDESS")):
    for f in files:
        if f.endswith('.wav'):
            test_audio = os.path.join(root, f)
            break
    if test_audio:
        break

if not test_audio:
    print("❌ No se encontró ningún archivo .wav")
    sys.exit(1)

print(f"📁 Probando con: {test_audio}")
print("-" * 60)

# PASO 1: Cargar con librosa
print("\n1️⃣ Cargando audio con librosa...")
try:
    y, sr = librosa.load(test_audio, sr=16000, mono=True)
    print(f"✅ Audio cargado exitosamente")
    print(f"   - Shape: {y.shape}")
    print(f"   - Sample rate: {sr} Hz")
    print(f"   - Duración: {len(y)/sr:.2f} segundos")
except Exception as e:
    print(f"❌ Error cargando audio: {e}")
    sys.exit(1)

# PASO 2: Crear diccionario audio_data
print("\n2️⃣ Creando diccionario audio_data...")
audio_data = {
    'y': y,
    'sr': sr,
    'duration': len(y) / sr
}
print(f"✅ Diccionario creado")
print(f"   - Keys: {list(audio_data.keys())}")
print(f"   - y type: {type(audio_data['y'])}")
print(f"   - sr type: {type(audio_data['sr'])}")

# PASO 3: Probar FeatureExtractor
print("\n3️⃣ Probando FeatureExtractor...")
try:
    fe = FeatureExtractor()
    print(f"✅ FeatureExtractor instanciado")
    
    print("\n   Extrayendo features...")
    features = fe.extract(audio_data)
    
    if features is None:
        print("❌ FeatureExtractor.extract() devolvió None")
    elif not isinstance(features, dict):
        print(f"❌ FeatureExtractor.extract() devolvió {type(features)} en lugar de dict")
    else:
        print(f"✅ Features extraídas exitosamente")
        print(f"   - Número de features: {len(features)}")
        print(f"   - Keys: {list(features.keys())[:10]}...")  # Primeras 10
        
        # Verificar contenido
        print("\n   Verificando contenido de features:")
        for key, val in list(features.items())[:5]:  # Primeras 5
            print(f"   - {key}: {type(val)}, value={val}")
            
except Exception as e:
    print(f"❌ Error en FeatureExtractor: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# PASO 4: Convertir a array
print("\n4️⃣ Convirtiendo features a numpy array...")
try:
    feature_values = []
    for key in sorted(features.keys()):
        val = features[key]
        if isinstance(val, (list, np.ndarray)):
            if isinstance(val, list):
                val = np.array(val)
            if val.ndim > 0:
                feature_values.extend(val.flatten())
            else:
                feature_values.append(float(val))
        else:
            feature_values.append(float(val))
    
    features_array = np.array(feature_values, dtype=np.float32)
    print(f"✅ Array creado exitosamente")
    print(f"   - Shape: {features_array.shape}")
    print(f"   - Primeros valores: {features_array[:5]}")
    
except Exception as e:
    print(f"❌ Error convirtiendo a array: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ TODAS LAS PRUEBAS PASARON")
print("=" * 60)