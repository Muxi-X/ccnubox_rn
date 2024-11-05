import React, { memo, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { PaginationType } from '@/components/pagination/types';

const Pagination: React.FC<PaginationType> = ({
  totalPages,
  currentPage,
  onChange,
  styles: propStyles = {
    active: { backgroundColor: 'white' },
    common: { backgroundColor: 'black' },
    both: { marginHorizontal: 16 },
  },
}) => {
  useEffect(() => {
    if (totalPages - 1 < currentPage || totalPages < 0)
      throw new Error('currentPage 的值超出范围');
  }, [totalPages, currentPage]);
  const handlePageChange = (newPage: number) => {
    onChange(newPage);
  };
  return (
    <View style={styles.paginationContainer}>
      {[...Array(totalPages)].map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            propStyles?.both,
            currentPage === index ? propStyles?.active : propStyles?.common,
          ]}
          onPress={() => handlePageChange(index)}
        ></TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'lightgray',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: 'black',
  },
  activeText: {
    color: 'white',
  },
});

export default memo(Pagination);
