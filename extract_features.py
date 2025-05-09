
import librosa
import librosa.display
import numpy as np
import pandas as pd
from datetime import datetime

def extract_features(audio_path):
    """
    Extract high-level audio features from a music file using Librosa.
    
    Parameters:
    audio_path (str): Path to the audio file
    
    Returns:
    dict: Dictionary of extracted features
    """
    # Load the audio file
    y, sr = librosa.load(audio_path, sr=None)
    
    # Initialize the feature dictionary
    features = {}

    # Pre-compute shared spectrograms and features
    n_fft = 2048
    hop_length = 512
    S = np.abs(librosa.stft(y, n_fft=n_fft, hop_length=hop_length))
    
    # Duration
    features['duration'] = librosa.get_duration(y=y, sr=sr)
    
    # Tempo (BPM)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)[0]
    features['tempo'] = tempo
    
    # Acousticness
    # Calculated based on spectral contrast and MFCCs
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    
    # Higher spectral contrast often indicates less acoustic sound
    features['acousticness'] = 1.0 - float(np.mean(contrast) / 50.0)  # Scale to 0-1
    
    # NEW FEATURE: Dynamic Range
    # Measure the variation in volume throughout the track
    frame_energies = np.sum(S**2, axis=0)
    
    # Convert to dB scale
    frame_db = librosa.amplitude_to_db(frame_energies, ref=np.max)
    
    # Calculate percentiles for dynamic range
    p_low = np.percentile(frame_db, 10)
    p_high = np.percentile(frame_db, 90)
    
    # Normalize to 0-1 scale (typical range is ~30-50dB)
    features['dynamic_range'] = float(min(1.0, (p_high - p_low) / 50.0))
    
    # NEW FEATURE: Emotion/Mood Dimensions
    # These attempt to capture additional emotional dimensions beyond valence

    # Energy
    # Energy can be calculated as the RMS (root mean square) energy
    rms = librosa.feature.rms(y=y).mean()
    features['energy'] = float(rms)  # Scale between 0-1 based on your dataset
    
    # NEW FEATURE: Sonic Texture
    # Brightness (spectral centroid)
    spectral_centroid = librosa.feature.spectral_centroid(S=S, sr=sr).mean()
    brightness = min(1.0, spectral_centroid / 5000.0)
    
    # Fullness (distribution of energy across spectrum)
    spectral_bandwidth = librosa.feature.spectral_bandwidth(S=S, sr=sr).mean()
    spectral_spread = min(1.0, spectral_bandwidth / 4000.0)
    
    # Density (ratio of non-zero frequency bins)
    spec_thresh = 0.01 * np.max(S)
    spec_density = np.mean((S > spec_thresh).astype(float))
    
    features['brightness'] = float(brightness)
    features['fullness'] = float(spectral_spread)
    features['density'] = float(min(1.0, spec_density * 5.0))

    # Instrumentalness - FIXED
    # Approximated using the presence of speech-like features
    # Lower MFCC variability in vocals range can indicate more instrumental content
    vocal_mfccs = mfccs[1:5, :]  # Focusing on MFCCs that capture vocal characteristics
    mfcc_std = np.std(vocal_mfccs)
    
    # Use exponential scaling to better handle the range of MFCC std values
    # This will map high values close to 0 and low values close to 1
    features['instrumentalness'] = float(np.exp(-0.1 * mfcc_std))
    
    # Danceability - FIXED
    # Approximated using beat strength and regularity
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    beat_strength = librosa.onset.onset_strength(y=y, sr=sr)
    beat_frames = librosa.util.fix_frames(beats, x_min=0, x_max=len(beat_strength))
    
    # Calculate beat regularity
    if len(beat_frames) > 1:
        beat_intervals = np.diff(beat_frames)
        beat_regularity = 1.0 - np.std(beat_intervals) / np.mean(beat_intervals)
        # Cap beat regularity between 0 and 1
        beat_regularity = max(0, min(1, beat_regularity))
    else:
        beat_regularity = 0
    
    # Calculate average beat strength with better normalization
    valid_frames = beat_frames[beat_frames < len(beat_strength)]
    if len(valid_frames) > 0:
        avg_beat_strength = np.mean(beat_strength[valid_frames])
        # Use a sigmoid-like function to normalize beat strength between 0 and 1
        strength_score = 1 / (1 + np.exp(-5 * (avg_beat_strength - 0.4)))
    else:
        strength_score = 0
    
    # Combine beat regularity and strength to calculate danceability
    # Weighted more toward beat regularity (0.7) than strength (0.3)
    danceability = 0.7 * beat_regularity + 0.3 * strength_score
    
    # Ensure danceability is between 0 and 1
    features['danceability'] = float(max(0, min(1, danceability)))
    
   # IMPROVED VALENCE ESTIMATION
    zcr = librosa.feature.zero_crossing_rate(y)[0].mean()
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)
    mode_factor = 0.8 if np.argmax(chroma_mean) in [0, 4, 7] else 0.5  # C, E, G = major-ish
    tempo_norm = np.clip((tempo - 50) / 150, 0, 1)
    centroid_norm = np.clip(spectral_centroid / 4000, 0, 1)
    zcr_norm = np.clip(zcr * 10, 0, 1)
    features['valence'] = float(
        0.3 * mode_factor +
        0.3 * tempo_norm +
        0.2 * centroid_norm +
        0.2 * zcr_norm
    )

    # Tension/Relaxation
    # Dissonance is related to tension
    S_power = S**2
    spectral_dissonance = librosa.feature.spectral_contrast(S=S_power, sr=sr)
    mean_dissonance = np.mean(spectral_dissonance[1:, :])  # Exclude first band
    
    # Combine with other tension indicators
    tension_score = (
        0.5 * min(1.0, mean_dissonance / 20.0) +
        0.3 * min(1.0, features.get('energy', 0.0) * 1.2) +
        0.2 * (1.0 - features.get('valence', 0.5))  # Lower valence often indicates tension
    )
    features['tension'] = float(min(1.0, tension_score))

    return features

def process_multiple_songs(file_paths):
    """
    Process multiple songs and return a DataFrame of features
    
    Parameters:
    file_paths (list): List of paths to audio files
    
    Returns:
    pd.DataFrame: DataFrame containing features for all songs
    """
    all_features = []
    
    for path in file_paths:
        try:
            features = extract_features(path)
            features['filename'] = path
            all_features.append(features)
        except Exception as e:
            print(f"Error processing {path}: {e}")
    
    return pd.DataFrame(all_features)

# %%
