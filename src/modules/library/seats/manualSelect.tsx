import React, { useState } from 'react';
import { View } from 'react-native';
import RegionMap from './components/regionMap';
import SelectRegion from './components/selectRegion';
import SelectTime from './components/selectTime';

//大组件
export default function ManualSelect() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  return (
    <View>
      <SelectRegion
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />
      <SelectTime />
      <RegionMap selectedRegion={selectedRegion} />
    </View>
  );
}
