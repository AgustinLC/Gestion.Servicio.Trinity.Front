import React, { useState } from "react";
import { Form } from "react-bootstrap";

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <Form.Control
            className="w-50"
            type="text"
            placeholder="Buscar..."
            value={query}
            onChange={handleChange}
        />
    );
};

export default SearchBar;