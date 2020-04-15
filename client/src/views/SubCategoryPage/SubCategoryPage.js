import React, { useEffect, useState } from "react";
import { getAllCategories } from "actions/category";
import { getAllSubcategories } from "actions/subcategory";
import Spinner from "../Dashboard/Spinner";
import styles from "assets/jss/material-kit-react/views/adminDashboard.js";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Button from "components/CustomButtons/Button.js";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// import Edit from '@material-ui/icons/Edit'
// import Delete from '@material-ui/icons/Delete';
import {
  TableHead,
  Table,
  TableRow,
  TableBody,
  TableCell,
} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Dialog from '@material-ui/core/Dialog';

import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import CardFooter from "components/Card/CardFooter.js";
import CustomInput from "components/CustomInput/CustomInput.js";

import Select from "react-select";

import { createSubcategory } from "../../actions/subcategory";
import { getCategoryList } from "../../actions/category";
import { deleteSubcategory } from "../../actions/subcategory";

const useStyles = makeStyles(styles);
const ViewSubcategories = ({
  createSubcategory,
  getCategoryList,
  getAllCategories,
  getAllSubcategories,
  deleteSubcategory,
  categoryList,
  category: { categories },
  subcategory: { subcategories, loading },
  history,
}) => {
  const classes = useStyles();

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
  });
  const { name, categoryId } = formData;

  // input
  const onChange = (e) =>
    setFormData({
      ...formData,
      name: e.target.value,
    });
  // select
  const onSelectChange = (e) =>
    setFormData({
      ...formData,
      categoryId: e.value,
    });
  // OnSubmit Event Handler
  const onSubmit = (e) => {
    e.preventDefault();
    createSubcategory(formData, history);
  };

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    console.log("inside view categories useeffect");
    getCategoryList();
    getAllCategories();
    getAllSubcategories();
  }, [getCategoryList, getAllCategories, getAllSubcategories]);

  return (
    <div className={classes.landingContainer}>
      <div className={classes.dashboardTitle}>
        <h3 align="center">
          <strong>Available Sub-Categories</strong>
        </h3>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className={classes.dashboardSubTitle}>
          {subcategories.length > 0 ? (
            <Table
              className={classes.table}
              aria-label="simple-table"
              component={Paper}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="left" className={classes.td}>
                    CATEGORY NAME
                  </TableCell>
                  <TableCell align="left" className={classes.td}>
                    SUB-CATEGORY NAME
                  </TableCell>
                  <TableCell align="center" className={classes.td}>
                    UPDATE SUB-CATEGORY NAME
                  </TableCell>
                  <TableCell align="center" className={classes.td}>
                    DELETE THE SUB-CATEGORY
                  </TableCell>
                </TableRow>
              </TableHead>
              {subcategories.map((subcategory) =>
                categories.map((category) =>
                  subcategory.categoryId === category._id ? (
                    <TableBody id={subcategory.name}>
                      <TableCell
                        align="left"
                        className={classes.td}
                        scope="row"
                      >
                        {category.name}
                      </TableCell>
                      <TableCell align="left" className={classes.td}>
                        {subcategory.name}
                      </TableCell>
                      <TableCell align="center" className={classes.td}>
                        <Button simple color="primary" size="lg">
                          Update
                        </Button>
                      </TableCell>
                      <TableCell align="center" className={classes.td}>
                        <Button
                          simple
                          onClick={() => deleteSubcategory(subcategory._id)}
                          color="primary"
                          size="lg"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableBody>
                  ) : (
                    <p></p>
                  )
                )
              )}
            </Table>
          ) : (
            <p>No sub categories found....</p>
          )}
        </div>
      )}
      <Button simple onClick={handleClickOpen} color="primary" size="lg">
        Create a new Sub-Category
      </Button>
      <Dialog open={open} onClose={handleClose} className={classes.dialogPaper}>
        <div className={classes.pageHeader}>
          <div className={classes.container}>
            <GridContainer justify="center">
              <GridItem>
                <Card>
                  <form className={classes.form} onSubmit={(e) => onSubmit(e)}>
                    <CardHeader color="primary" className={classes.cardHeader}>
                      <h4>Create a Sub-Category</h4>
                    </CardHeader>
                    <CardBody>
                      <Select
                        options={categoryList}
                        id="categoryId"
                        onChange={(e) => onSelectChange(e)}
                      />
                      <CustomInput
                        labelText="Create a sub-category"
                        id="name"
                        formControlProps={{
                          fullWidth: true,
                        }}
                        inputProps={{
                          type: "text",
                          value: name,
                          required: true,
                          onChange: (e) => onChange(e),
                        }}
                      />
                    </CardBody>
                    <CardFooter className={classes.cardFooter}>
                      <Button
                        simple
                        type="submit"
                        onClick={handleClose}
                        color="primary"
                        size="lg"
                      >
                        Add Sub-Category
                      </Button>
                      <Button
                        simple
                        onClick={handleClose}
                        color="primary"
                        size="lg"
                      >
                        Cancel
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </GridItem>
            </GridContainer>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

ViewSubcategories.propTypes = {
  createSubcategory: PropTypes.func.isRequired,
  getCategoryList: PropTypes.func.isRequired,
  getAllCategories: PropTypes.func.isRequired,
  getAllSubcategories: PropTypes.func.isRequired,
  deleteCategory: PropTypes.func.isRequired,
  category: PropTypes.object.isRequired,
  subcategory: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  error: state.auth.error,
  categoryList: state.categorylist.categoryList,
  category: state.category,
  subcategory: state.subcategory,
});

export default connect(
  mapStateToProps,
  {
    createSubcategory,
    getCategoryList,
    getAllCategories,
    getAllSubcategories,
    deleteSubcategory,
  }
)(ViewSubcategories);
