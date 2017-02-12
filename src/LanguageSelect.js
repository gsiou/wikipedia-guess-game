import React from 'react';

export const LanguageSelect = function(props) {
    return(
        <select value={props.language} className='Language-select' onChange={props.changeHandler}>
            <option value='en'>English</option>
            <option value='el'>Ελληνικά</option>
            <option value='fr'>Français</option>
            <option value='es'>Español</option>
            <option value='de'>Deutch</option>
            <option value='it'>Italiano</option>
            <option value='pt'>Português</option>
            <option value='ru'>Русский</option>
        </select>
    )
}
