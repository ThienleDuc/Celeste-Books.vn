import { Helmet } from "react-helmet";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found</title>
      </Helmet>
      <div>
        <h1>404 - Page Not Found</h1>
        <p>Trang bạn tìm kiếm không tồn tại.</p>
      </div>
    </>
  );
};

export default NotFound;
