import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../common/GradientBackground';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 4;

const EMOJIS = ['😊', '🌟', '❤️', '🎵', '🌈', '🌺', '🦋', '🌙'];

const MemoryGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval = null;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted, startTime]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      checkMatch();
    }
  }, [flippedCards]);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setGameCompleted(true);
      setGameStarted(false);
    }
  }, [matchedCards]);

  const initializeGame = () => {
    const shuffledCards = shuffleArray([...EMOJIS, ...EMOJIS]).map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setGameCompleted(false);
    setGameStarted(false);
    setElapsedTime(0);
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleCardPress = (cardId) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (matchedCards.includes(cardId)) return;

    setFlippedCards([...flippedCards, cardId]);
  };

  const checkMatch = () => {
    const [firstId, secondId] = flippedCards;
    const firstCard = cards.find(c => c.id === firstId);
    const secondCard = cards.find(c => c.id === secondId);

    setMoves(moves + 1);

    if (firstCard.emoji === secondCard.emoji) {
      // Match found
      setTimeout(() => {
        setMatchedCards([...matchedCards, firstId, secondId]);
        setFlippedCards([]);
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCard = (card) => {
    const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
    const isMatched = matchedCards.includes(card.id);

    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          isFlipped && styles.cardFlipped,
          isMatched && styles.cardMatched
        ]}
        onPress={() => handleCardPress(card.id)}
        disabled={isFlipped || flippedCards.length === 2}
        activeOpacity={0.7}
      >
        <Text style={[styles.cardEmoji, !isFlipped && styles.cardBack]}>
          {isFlipped ? card.emoji : '?'}
        </Text>
      </TouchableOpacity>
    );
  };

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
          <Text style={[styles.title, { color: colors.text }]}>Juego de Memoria</Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statBox}>
            <Ionicons name="swap-horizontal" size={24} color={colors.info} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Movimientos</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{moves}</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="time" size={24} color={colors.info} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tiempo</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatTime(elapsedTime)}</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={24} color={colors.info} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Parejas</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{matchedCards.length / 2}/{EMOJIS.length}</Text>
          </View>
        </View>

        {/* Game Board */}
        <ScrollView style={styles.gameContainer} contentContainerStyle={styles.gameBoard}>
          {cards.map(card => renderCard(card))}
        </ScrollView>

        {/* Completed Modal */}
        {gameCompleted && (
          <View style={styles.completedOverlay}>
            <View style={[styles.completedCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="trophy" size={80} color="#FFD700" />
              <Text style={[styles.completedTitle, { color: colors.text }]}>¡Felicitaciones!</Text>
              <Text style={[styles.completedText, { color: colors.textSecondary }]}>
                Completaste el juego en:
              </Text>
              <Text style={[styles.completedStat, { color: colors.info }]}>
                {moves} movimientos
              </Text>
              <Text style={[styles.completedStat, { color: colors.info }]}>
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
  gameContainer: {
    flex: 1,
    marginTop: 8,
  },
  gameBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: 5,
    borderRadius: 12,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardFlipped: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  cardMatched: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  cardEmoji: {
    fontSize: 40,
  },
  cardBack: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
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

export default MemoryGame;
