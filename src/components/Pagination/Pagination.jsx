import Pagination from 'react-bootstrap/Pagination';
import PropTypes from 'prop-types';

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    const renderPaginationItems = () => {
        const paginationItems = [];

        // Recorrer todas las páginas y mostrarlas
        for (let page = 1; page <= totalPages; page++) {
            paginationItems.push(
                <Pagination.Item key={page} active={page === currentPage} onClick={() => onPageChange(page)}>
                    {page}
                </Pagination.Item>
            );
        }

        return paginationItems;
    };

    return (
        <Pagination>
            <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
            {renderPaginationItems()}
            <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
    );
};

PaginationComponent.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default PaginationComponent;
