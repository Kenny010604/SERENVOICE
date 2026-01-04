import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../common/GradientBackground';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const TILE_SIZE = (width - 80) / GRID_SIZE;

const PuzzleGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval = null;
    if (gameStarted && !isCompleted) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, isCompleted, startTime]);

  useEffect(() => {
    checkWin();
  }, [tiles]);

  const initializeGame = () => {
    const initialTiles = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
      id: i,
      value: i === GRID_SIZE * GRID_SIZE - 1 ? null : i + 1,
      position: i
    }));
    
    shuffleTiles(initialTiles);
    setMoves(0);
    setIsCompleted(false);
    setGameStarted(false);
    setElapsedTime(0);
  };

  const shuffleTiles = (tilesArray) => {
    let shuffled = [...tilesArray];
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Update positions
    shuffled = shuffled.map((tile, index) => ({
      ...tile,
      position: index
    }));
    
    setTiles(shuffled);
  };

  const handleTilePress = (tilePosition) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    const emptyTile = tiles.find(t => t.value === null);
    const emptyPosition = emptyTile.position;
    
    const row = Math.floor(tilePosition / GRID_SIZE);
    const col = tilePosition % GRID_SIZE;
    const emptyRow = Math.floor(emptyPosition / GRID_SIZE);
    const emptyCol = emptyPosition % GRID_SIZE;
    
    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    
    if (isAdjacent) {
      const newTiles = tiles.map(tile => {
        if (tile.position === tilePosition) {
          return { ...tile, position: emptyPosition };
        }
        if (tile.position === emptyPosition) {
          return { ...tile, position: tilePosition };
        }
        return tile;
      });
      
      setTiles(newTiles);
      setMoves(moves + 1);
    }
  };

  const checkWin = () => {
    if (tiles.length === 0) return;
    
    const isWin = tiles.every((tile) => {
      if (tile.value === null) {
        return tile.position === GRID_SIZE * GRID_SIZE - 1;
      }
      return tile.position === tile.id;
    });
    
    if (isWin && gameStarted) {
      setIsCompleted(true);
      setGameStarted(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTileColor = (value) => {
    if (!value) return 'transparent';
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    return colors[(value - 1) % colors.length];
  };

  const renderTile = (tile) => {
    if (tile.value === null) {
      return (
        <View key={tile.id} style={[styles.tile, styles.emptyTile]}>
          <Text style={styles.tileText}></Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={tile.id}
        style={[
          styles.tile,
          { backgroundColor: getTileColor(tile.value) }
        ]}
        onPress={() => handleTilePress(tile.position)}
        activeOpacity={0.7}
      >
        <Text style={styles.tileText}>{tile.value}</Text>
      </TouchableOpacity>
    );
  };

  // Sort tiles by position for rendering
  const sortedTiles = [...tiles].sort((a, b) => a.position - b.position);

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Puzzle Numérico</Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statBox}>
            <Ionicons name="swap-horizontal" size={24} color={colors.warning} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Movimientos</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{moves}</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="time" size={24} color={colors.warning} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tiempo</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatTime(elapsedTime)}</Text>
          </View>
        </View>

        {/* Instructions */}
        {!gameStarted && (
          <View style={[styles.instructions, { backgroundColor: colors.surface }]}>
            <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
              Ordena los números del 1 al 8 moviendo las fichas adyacentes al espacio vacío
            </Text>
          </View>
        )}

        {/* Puzzle Grid */}
        <View style={styles.puzzleContainer}>
          <View style={[styles.grid, { backgroundColor: colors.border }]}>
            {sortedTiles.map(tile => renderTile(tile))}
          </View>
        </View>

        {/* Completed Modal */}
        {isCompleted && (
          <View style={styles.completedOverlay}>
            <View style={[styles.completedCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
              <Text style={[styles.completedTitle, { color: colors.text }]}>¡Puzzle Resuelto!</Text>
              <Text style={[styles.completedText, { color: colors.textSecondary }]}>
                Lo completaste en:
              </Text>
              <Text style={[styles.completedStat, { color: colors.warning }]}>
                {moves} movimientos
              </Text>
              <Text style={[styles.completedStat, { color: colors.warning }]}>
                {formatTime(elapsedTime)}
              </Text>

              <View style={styles.completedButtons}>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.success }]}
                  onPress={initializeGame}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Jugar de nuevo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.textMuted }]}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="home" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Volver</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={[styles.controls, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.error }]}
            onPress={initializeGame}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Reiniciar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginTop: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  instructions: {
    padding: 16,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  instructionsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  puzzleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  grid: {
    width: TILE_SIZE * GRID_SIZE + 20,
    height: TILE_SIZE * GRID_SIZE + 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    borderRadius: 12,
  },
  tile: {
    width: TILE_SIZE - 10,
    height: TILE_SIZE - 10,
    margin: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyTile: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  tileText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  completedText: {
    fontSize: 16,
    marginBottom: 16,
  },
  completedStat: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  completedButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  controls: {
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PuzzleGame;
