import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useApi } from "../../hooks/useApi";

interface Role {
  id: string;
  name: string;
}

const RegisterPage: React.FC = () => {
  const { get, post } = useApi();

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    roles: [] as string[],
    groups: [] as string[],
  });

  const [roleOptions, setRoleOptions] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      roles: [e.target.value],
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await post("/auth/register", form);
      alert("등록 성공");
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRolesFromAllUsers = async () => {
      try {
        // 전체 유저 목록 조회
        const usersRes = await get<{ data: { id: string }[] }>(
          "/users?page=1&size=50",
        );
        const userIds = usersRes.data?.map((u) => u.id) ?? [];

        // 각 유저에 대한 role-available 호출
        const roleResList = await Promise.allSettled(
          userIds.map((id) =>
            get<{ data: Role[] }>(`/users/${id}/role-available?page=1&size=50`),
          ),
        );

        // 성공 응답만 추출
        const allRoles = roleResList
          .filter(
            (res): res is PromiseFulfilledResult<{ data: Role[] }> =>
              res.status === "fulfilled",
          )
          .flatMap((res) => res.value.data || []);

        // role.id 기준 중복 제거
        const uniqueRoles = Array.from(
          new Map(allRoles.map((r) => [r.id, r])).values(),
        );

        setRoleOptions(uniqueRoles);
      } catch (err) {
        console.error("역할 목록 조회 실패", err);
      }
    };

    fetchRolesFromAllUsers();
  }, []);

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        회원가입
      </Typography>

      {/* 입력 필드 */}
      <TextField
        fullWidth
        name="username"
        label="아이디"
        value={form.username}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        name="password"
        label="비밀번호"
        type="password"
        value={form.password}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        name="email"
        label="이메일"
        value={form.email}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        name="first_name"
        label="이름"
        value={form.first_name}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        name="last_name"
        label="성"
        value={form.last_name}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      {/* 역할 선택 */}
      <TextField
        fullWidth
        select
        label="역할"
        value={form.roles[0] || ""}
        onChange={handleRoleChange}
        sx={{ mb: 3 }}
      >
        {roleOptions.map((role) => (
          <MenuItem key={role.id} value={role.name}>
            {role.name}
          </MenuItem>
        ))}
      </TextField>

      {/* 제출 버튼 */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "가입"}
      </Button>
    </Box>
  );
};

export default RegisterPage;
