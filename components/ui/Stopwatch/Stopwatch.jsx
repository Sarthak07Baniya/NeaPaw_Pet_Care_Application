import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Stopwatch = ({ start, reset, options, getTime, laps }) => {
  const [time, setTime] = useState(0);
  const intervalRef = useRef(null);
  const previousStartRef = useRef(start);

  useEffect(() => {
    if (start && !previousStartRef.current) {
      // Start the stopwatch
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!start && previousStartRef.current) {
      // Stop the stopwatch
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    previousStartRef.current = start;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [start]);

  useEffect(() => {
    if (reset) {
      setTime(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [reset]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formattedTime = formatTime(time);

  useEffect(() => {
    if (getTime) {
      getTime(formattedTime);
    }
  }, [formattedTime, getTime]);

  return (
    <View style={[styles.container, options?.container]}>
      <Text style={[styles.text, options?.text]}>{formattedTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF4EA',
    paddingVertical: 18,
    borderRadius: 8,
    marginTop: 15,
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  text: {
    fontSize: 35,
    color: '#27323A',
    marginLeft: 7,
    fontWeight: 'bold',
  },
});

export default Stopwatch;
