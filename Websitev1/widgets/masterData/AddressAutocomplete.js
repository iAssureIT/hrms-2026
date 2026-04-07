// import React, { useState } from "react";
// import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

// const AddressAutocomplete = ({ onAddressSelect }) => {
//   const [address, setAddress] = useState("");

//   const handleChange = (address) => {
//     setAddress(address);
//   };

//   const handleSelect = async (address) => {
//     setAddress(address);
//     try {
//       const results = await geocodeByAddress(address);
//       const latLng = await getLatLng(results[0]);
//       console.log("Success", latLng);
//       onAddressSelect(results[0]);
//     } catch (error) {
//       console.error("Error", error);
//     }
//   };

//   return (
//     <PlacesAutocomplete
//       value={address}
//       onChange={handleChange}
//       onSelect={handleSelect}
//     >
//       {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
//         <div>
//           <input
//             {...getInputProps({
//               placeholder: 'Search Places ...',
//               className: 'location-search-input',
//             })}
//           />
//           <div className="autocomplete-dropdown-container">
//             {loading && <div>Loading...</div>}
//             {suggestions.map((suggestion) => {
//               const className = suggestion.active
//                 ? 'suggestion-item--active'
//                 : 'suggestion-item';
//               const style = suggestion.active
//                 ? { backgroundColor: '#fafafa', cursor: 'pointer' }
//                 : { backgroundColor: '#ffffff', cursor: 'pointer' };
//               return (
//                 <div
//                   {...getSuggestionItemProps(suggestion, {
//                     className,
//                     style,
//                   })}
//                 >
//                   <span>{suggestion.description}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </PlacesAutocomplete>
//   );
// };

// export default AddressAutocomplete;
// import React, { useState } from "react";
// import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

// const AddressAutocomplete = ({ onAddressSelect }) => {
//   const [address, setAddress] = useState("");

//   const handleChange = (address) => {
//     setAddress(address);
//   };

//   const handleSelect = async (address) => {
//     setAddress(address);
//     try {
//       const results = await geocodeByAddress(address);
//       const latLng = await getLatLng(results[0]);
//       console.log("Success", latLng);
//       onAddressSelect(results[0], latLng);
//     } catch (error) {
//       console.error("Error", error);
//     }
//   };

//   return (
//     <section>
//       <PlacesAutocomplete
//         value={address}
//         onChange={handleChange}
//         onSelect={handleSelect}
//       >
//         {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
//           <div>
//             <input
//               {...getInputProps({
//                 placeholder: 'Search Places ...',
//                 className: 'location-search-input',
//               })}
//             />
//             <div className="autocomplete-dropdown-container">
//               {loading && <div>Loading...</div>}
//               {suggestions.map((suggestion) => {
//                 const className = suggestion.active
//                   ? 'suggestion-item--active'
//                   : 'suggestion-item';
//                 const style = suggestion.active
//                   ? { backgroundColor: '#fafafa', cursor: 'pointer' }
//                   : { backgroundColor: '#ffffff', cursor: 'pointer' };
//                 return (
//                   <div
//                     {...getSuggestionItemProps(suggestion, {
//                       className,
//                       style,
//                     })}
//                   >
//                     <span>{suggestion.description}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </PlacesAutocomplete>
//     </section>
//   );
// };

// export default AddressAutocomplete;
// components/AddressAutocomplete.js







// import React, { useRef, useEffect } from 'react';

// const AddressAutocomplete = ({ onAddressSelect }) => {
//   const inputRef = useRef(null);

//   useEffect(() => {
//     const loadScript = (url, callback) => {
//       let script = document.createElement('script');
//       script.type = 'text/javascript';

//       if (script.readyState) {
//         script.onreadystatechange = function () {
//           if (script.readyState === 'loaded' || script.readyState === 'complete') {
//             script.onreadystatechange = null;
//             callback();
//           }
//         };
//       } else {
//         script.onload = () => callback();
//       }

//       script.src = url;
//       document.getElementsByTagName('head')[0].appendChild(script);
//     };

//     const handleScriptLoad = () => {
//       const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
//         types: ['address'],
//         componentRestrictions: { country: 'us' }
//       });

//       autocomplete.addListener('place_changed', () => {
//         const place = autocomplete.getPlace();
//         onAddressSelect(place.formatted_address, {
//           lat: place.geometry.location.lat(),
//           lng: place.geometry.location.lng()
//         });
//       });
//     };

//     if (!window.google) {
//       loadScript(
//         `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`,
//         handleScriptLoad
//       );
//     } else {
//       handleScriptLoad();
//     }
//   }, [onAddressSelect]);

//   return (
//     <input
//       ref={inputRef}
//       type="text"
//       placeholder="Enter address"
//       className="stdInputField"
//     />
//   );
// };

// export default AddressAutocomplete;




// components/AddressAutocomplete.js
import React, { useRef, useEffect, useState } from 'react';

const AddressAutocomplete = ({ onAddressSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const autocompleteServiceRef = useRef(null);

  useEffect(() => {
    if (window.google) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;
    if (value && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions({ input: value }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSuggestions(predictions);
        }
      });
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (suggestion) => {
    inputRef.current.value = suggestion.description;
    setSuggestions([]);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: suggestion.description }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        const location = results[0].geometry.location;
        onAddressSelect(suggestion.description, { lat: location.lat(), lng: location.lng() });
      }
    });
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter address"
        className="stdInputField"
        onChange={handleChange}
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 w-full z-10 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              className="cursor-pointer p-2 hover:bg-gray-200"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;

