"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  Card,
  CardBody,
  Typography,
  Select,
  Option,
  Input,
  Button,
} from "@material-tailwind/react";
import { FaBell, FaSpinner } from "react-icons/fa";

const AddTemplate = ({ template_id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const [user_id, setUserId] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      templateType: "EMAIL",
      status: "active",
      role: "all",
    },
  });

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const parsed = JSON.parse(userDetails);
      setUserId(parsed.user_id);
    }
    getRoles();
    if (template_id) {
      getTemplateDetails(template_id);
    }
  }, [template_id]);

  const getRoles = () => {
    axios
      .post("/api/roles/get/list")
      .then((res) => {
        setRoleList(res.data);
      })
      .catch((err) => console.error("Error fetching roles:", err));
  };

  const getTemplateDetails = (id) => {
    setFetching(true);
    axios
      .get(`/api/masternotifications/get/${id}`)
      .then((res) => {
        const data = res.data;
        reset({
          templateType: data.templateType,
          templateName: data.templateName,
          event: data.event,
          role: data.role,
          subject: data.subject,
          content: data.content,
          status: data.status,
        });
        setFetching(false);
      })
      .catch((err) => {
        console.error("Error fetching template details:", err);
        setFetching(false);
      });
  };

  const onSubmit = (data) => {
    setLoading(true);
    const formValues = {
      ...data,
      user_id: user_id,
    };

    if (template_id) {
      formValues.editId = template_id;
      axios
        .patch("/api/masternotifications/update", formValues)
        .then((res) => {
          setLoading(false);
          swal.fire("Success", "Template updated successfully!", "success");
          router.back();
        })
        .catch((err) => {
          setLoading(false);
          swal.fire("Error", "Failed to update template", "error");
        });
    } else {
      axios
        .post("/api/masternotifications/post", formValues)
        .then((res) => {
          setLoading(false);
          if (res.data.message === "Notification Details already exists") {
            swal.fire("Warning", res.data.message, "warning");
          } else {
            swal.fire("Success", "Template created successfully!", "success");
            reset();
          }
        })
        .catch((err) => {
          setLoading(false);
          swal.fire("Error", "Failed to create template", "error");
        });
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-green" />
      </div>
    );
  }

  return (
    <section className=" section w-full p-6">
      <Card className="shadow-lg border border-gray-200">
        <CardBody>
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <FaBell className="text-2xl text-green" />
            <Typography variant="h5" color="blue-gray">
              {template_id
                ? "Edit Notification Template"
                : "Create New Notification Template"}
            </Typography>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Template Type */}
              <div className="space-y-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                >
                  Template Type <span className="text-red-500">*</span>
                </Typography>
                <Controller
                  name="templateType"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Select Type"
                      error={!!errors.templateType}
                    >
                      <Option value="EMAIL">Email</Option>
                      <Option value="SMS">SMS</Option>
                      <Option value="IN-APP">In-App</Option>
                      <Option value="WHATSAPP">Whatsapp</Option>
                    </Select>
                  )}
                />
              </div>

              {/* Event Name */}
              <div className="space-y-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                >
                  Event <span className="text-red-500">*</span>
                </Typography>
                <Input
                  {...register("event", { required: true })}
                  placeholder="e.g. User Registration"
                  label="Event Name"
                  error={!!errors.event}
                />
              </div>

              {/* Template Name */}
              <div className="space-y-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                >
                  Template Name <span className="text-red-500">*</span>
                </Typography>
                <Input
                  {...register("templateName", { required: true })}
                  placeholder="e.g. Welcome Email"
                  label="Template Name"
                  error={!!errors.templateName}
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                >
                  Role <span className="text-red-500">*</span>
                </Typography>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Select Role"
                      error={!!errors.role}
                    >
                      <Option value="all">All Roles</Option>
                      {roleList.map((role) => (
                        <Option key={role._id} value={role.role}>
                          {role.role}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                >
                  Status <span className="text-red-500">*</span>
                </Typography>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Select Status"
                      error={!!errors.status}
                    >
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Subject - Only for Email */}
            <div className="space-y-2">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-semibold"
              >
                Subject{" "}
                {watch("templateType") === "EMAIL" && (
                  <span className="text-red-500">*</span>
                )}
              </Typography>
              <Input
                {...register("subject", {
                  required: watch("templateType") === "EMAIL",
                })}
                placeholder="Message Subject"
                label="Subject"
                error={!!errors.subject}
              />
            </div>

            {/* Content - CKEditor */}
            <div className="space-y-2">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-semibold"
              >
                Message Content <span className="text-red-500">*</span>
              </Typography>
              <div className="prose max-w-none">
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CKEditor
                      editor={ClassicEditor}
                      data={field.value || ""}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        field.onChange(data);
                      }}
                    />
                  )}
                />
                {errors.content && (
                  <Typography variant="small" color="red" className="mt-1">
                    Content is required
                  </Typography>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button
                variant="outlined"
                color="red"
                onClick={() => router.back()}
                className="px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="green"
                className="px-8 flex items-center gap-2"
                disabled={loading}
              >
                {loading && <FaSpinner className="animate-spin" />}
                {template_id ? "Update Template" : "Save Template"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </section>
  );
};

export default AddTemplate;
