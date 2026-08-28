// High-resolution destination photography mapping with extensive global coverage
export const getDestinationCoverImage = (tripOrDest) => {
  if (!tripOrDest) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

  if (typeof tripOrDest === 'object' && tripOrDest?.coverImage?.url) {
    return tripOrDest.coverImage.url;
  }

  let text = '';
  if (typeof tripOrDest === 'string') {
    text = tripOrDest.toLowerCase();
  } else {
    const city = tripOrDest.destination?.city || '';
    const country = tripOrDest.destination?.country || '';
    const title = tripOrDest.title || '';
    text = `${city} ${country} ${title}`.toLowerCase();
  }

  // Vietnam / Hanoi / Sapa / Halong
  if (text.includes('vietnam') || text.includes('hanoi') || text.includes('sapa') || text.includes('halong') || text.includes('da nang') || text.includes('ho chi minh')) {
    return 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80';
  }

  // Japan / Kyoto / Tokyo / Osaka / Mount Fuji
  if (text.includes('japan') || text.includes('kyoto') || text.includes('tokyo') || text.includes('osaka') || text.includes('fuji')) {
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80';
  }

  // Switzerland / Alps / Zermatt / Interlaken / Zurich
  if (text.includes('swiss') || text.includes('switzerland') || text.includes('alps') || text.includes('zermatt') || text.includes('interlaken')) {
    return 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80';
  }

  // Italy / Rome / Florence / Venice / Amalfi / Milan
  if (text.includes('italy') || text.includes('rome') || text.includes('florence') || text.includes('venice') || text.includes('amalfi') || text.includes('milan')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80';
  }

  // France / Paris / Nice / Provence / Lyon
  if (text.includes('france') || text.includes('paris') || text.includes('nice') || text.includes('provence')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80';
  }

  // Indonesia / Bali / Ubud / Nusa / Jakarta
  if (text.includes('bali') || text.includes('indonesia') || text.includes('ubud') || text.includes('lombok')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80';
  }

  // UAE / Dubai / Abu Dhabi
  if (text.includes('dubai') || text.includes('uae') || text.includes('abu dhabi') || text.includes('emirates')) {
    return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80';
  }

  // UK / London / Scotland / Edinburgh / Britain
  if (text.includes('london') || text.includes('uk') || text.includes('britain') || text.includes('scotland') || text.includes('edinburgh') || text.includes('england')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80';
  }

  // USA / New York / California / Hawaii / Miami
  if (text.includes('new york') || text.includes('usa') || text.includes('america') || text.includes('california') || text.includes('hawaii') || text.includes('miami')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80';
  }

  // Thailand / Bangkok / Phuket / Chiang Mai
  if (text.includes('thailand') || text.includes('bangkok') || text.includes('phuket') || text.includes('chiang mai')) {
    return 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80';
  }

  // Greece / Santorini / Athens / Mykonos
  if (text.includes('greece') || text.includes('santorini') || text.includes('athens') || text.includes('mykonos')) {
    return 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80';
  }

  // Spain / Barcelona / Madrid / Seville
  if (text.includes('spain') || text.includes('barcelona') || text.includes('madrid') || text.includes('seville')) {
    return 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80';
  }

  // Turkey / Istanbul / Cappadocia
  if (text.includes('turkey') || text.includes('istanbul') || text.includes('cappadocia')) {
    return 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80';
  }

  // Australia / Sydney / Melbourne
  if (text.includes('australia') || text.includes('sydney') || text.includes('melbourne')) {
    return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80';
  }

  // Egypt / Cairo / Giza / Pyramids
  if (text.includes('egypt') || text.includes('cairo') || text.includes('giza') || text.includes('pyramid')) {
    return 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80';
  }

  // Morocco / Marrakech / Casablanca
  if (text.includes('morocco') || text.includes('marrakech') || text.includes('casablanca')) {
    return 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80';
  }

  // Brazil / Rio / Amazon
  if (text.includes('brazil') || text.includes('rio')) {
    return 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80';
  }

  // Iceland / Reykjavik / Aurora
  if (text.includes('iceland') || text.includes('reykjavik') || text.includes('aurora')) {
    return 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80';
  }

  // Canada / Banff / Vancouver / Toronto
  if (text.includes('canada') || text.includes('banff') || text.includes('vancouver') || text.includes('toronto')) {
    return 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80';
  }

  // Germany / Berlin / Munich
  if (text.includes('germany') || text.includes('berlin') || text.includes('munich') || text.includes('bavaria')) {
    return 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80';
  }

  // Singapore
  if (text.includes('singapore') || text.includes('marina bay')) {
    return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80';
  }

  // Portugal / Lisbon / Porto
  if (text.includes('portugal') || text.includes('lisbon') || text.includes('porto')) {
    return 'https://images.unsplash.com/photo-1555881400-74d7acaacd81?auto=format&fit=crop&w=800&q=80';
  }

  // Default atmospheric travel fallback
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
};
