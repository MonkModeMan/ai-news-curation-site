---
title: 🐯 Liger GRPO meets TRL
description: ''
pubDate: Sun, 25 May 2025 00:00:00 GMT
source: Hugging Face Blog
tags:
- huggingface
- transformers
- nlp
url: https://huggingface.co/blog/liger-grpo
---

Thank you for your great work.
Anyway, I tested the liger loss with deepspeed zero3 using Qwen/Qwen2.5-0.5B-Instruct
in a bf16
.
I met an shape mismatch as stated below:
[rank0]: Traceback (most recent call last):
[rank0]: File "/workspace/temp.py", line 22, in <module>
[rank0]: trainer.train()
[rank0]: File "/usr/local/lib/python3.11/dist-packages/transformers/trainer.py", line 2238, in train
[rank0]: return inner_training_loop(
[rank0]: ^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/transformers/trainer.py", line 2553, in _inner_training_loop
[rank0]: tr_loss_step = self.training_step(model, inputs, num_items_in_batch)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/transformers/trainer.py", line 3730, in training_step
[rank0]: loss = self.compute_loss(model, inputs, num_items_in_batch=num_items_in_batch)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/trl/extras/profiling.py", line 87, in wrapper
[rank0]: return func(self, *args, **kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/trl/trainer/grpo_trainer.py", line 1187, in compute_loss
[rank0]: return self.compute_liger_loss(model, inputs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/trl/trainer/grpo_trainer.py", line 1160, in compute_liger_loss
[rank0]: loss, metrics = self.liger_grpo_loss(
[rank0]: ^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/nn/modules/module.py", line 1739, in _wrapped_call_impl
[rank0]: return self._call_impl(*args, **kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/nn/modules/module.py", line 1750, in _call_impl
[rank0]: return forward_call(*args, **kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/liger_kernel/chunked_loss/grpo_loss.py", line 249, in forward
[rank0]: return LigerFusedLinearGRPOFunction.apply(
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/autograd/function.py", line 575, in apply
[rank0]: return super().apply(*args, **kwargs) # type: ignore[misc]
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/liger_kernel/chunked_loss/grpo_loss.py", line 142, in forward
[rank0]: return super().forward(
[rank0]: ^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/liger_kernel/chunked_loss/fused_linear_ppo.py", line 219, in forward
[rank0]: accumulate_chunk(
[rank0]: File "/usr/local/lib/python3.11/dist-packages/liger_kernel/chunked_loss/fused_linear_ppo.py", line 132, in accumulate_chunk
[rank0]: (chunk_grad_input, chunk_grad_weight, *chunk_grad_bias), (chunk_loss, chunk_metrics) = fused_fwd_bwd(
[rank0]: ^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/eval_frame.py", line 574, in _fn
[rank0]: return fn(*args, **kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/convert_frame.py", line 1380, in __call__
[rank0]: return self._torchdynamo_orig_callable(
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/convert_frame.py", line 1164, in __call__
[rank0]: result = self._inner_convert(
[rank0]: ^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/convert_frame.py", line 547, in __call__
[rank0]: return _compile(
[rank0]: ^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/convert_frame.py", line 986, in _compile
[rank0]: guarded_code = compile_inner(code, one_graph, hooks, transform)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/convert_frame.py", line 715, in compile_inner
[rank0]: return _compile_inner(code, one_graph, hooks, transform)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_utils_internal.py", line 95, in wrapper_function
[rank0]: return function(*args, **kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/convert_frame.py", line 750, in _compile_inner
[rank0]: out_code = transform_code_object(code, transform)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/bytecode_transformation.py", line 1361, in transform_code_object
[rank0]: transformations(instructions, code_options)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/convert_frame.py", line 231, in _fn
[rank0]: return fn(*args, **kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/convert_frame.py", line 662, in transform
[rank0]: tracer.run()
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 2868, in run
[rank0]: super().run()
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 1052, in run
[rank0]: while self.step():
[rank0]: ^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 962, in step
[rank0]: self.dispatch_table[inst.opcode](self, inst)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 659, in wrapper
[rank0]: return inner_fn(self, inst)
[rank0]: ^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 2341, in CALL
[rank0]: self._call(inst)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 2335, in _call
[rank0]: self.call_function(fn, args, kwargs)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 897, in call_function
[rank0]: self.push(fn.call_function(self, args, kwargs)) # type: ignore[arg-type]
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/functions.py", line 118, in call_function
[rank0]: return tx.inline_user_function_return(self, [*self.self_args(), *args], kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 903, in inline_user_function_return
[rank0]: return InliningInstructionTranslator.inline_call(self, fn, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 3072, in inline_call
[rank0]: return cls.inline_call_(parent, func, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 3198, in inline_call_
[rank0]: tracer.run()
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 1052, in run
[rank0]: while self.step():
[rank0]: ^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 962, in step
[rank0]: self.dispatch_table[inst.opcode](self, inst)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 659, in wrapper
[rank0]: return inner_fn(self, inst)
[rank0]: ^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 2341, in CALL
[rank0]: self._call(inst)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 2335, in _call
[rank0]: self.call_function(fn, args, kwargs)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 897, in call_function
[rank0]: self.push(fn.call_function(self, args, kwargs)) # type: ignore[arg-type]
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/functions.py", line 317, in call_function
[rank0]: return super().call_function(tx, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/functions.py", line 118, in call_function
[rank0]: return tx.inline_user_function_return(self, [*self.self_args(), *args], kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 903, in inline_user_function_return
[rank0]: return InliningInstructionTranslator.inline_call(self, fn, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 3072, in inline_call
[rank0]: return cls.inline_call_(parent, func, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 3198, in inline_call_
[rank0]: tracer.run()
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 1052, in run
[rank0]: while self.step():
[rank0]: ^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 962, in step
[rank0]: self.dispatch_table[inst.opcode](self, inst)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 659, in wrapper
[rank0]: return inner_fn(self, inst)
[rank0]: ^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 1736, in CALL_FUNCTION_EX
[rank0]: self.call_function(fn, argsvars.items, kwargsvars)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 897, in call_function
[rank0]: self.push(fn.call_function(self, args, kwargs)) # type: ignore[arg-type]
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/functions.py", line 317, in call_function
[rank0]: return super().call_function(tx, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/functions.py", line 118, in call_function
[rank0]: return tx.inline_user_function_return(self, [*self.self_args(), *args], kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 903, in inline_user_function_return
[rank0]: return InliningInstructionTranslator.inline_call(self, fn, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 3072, in inline_call
[rank0]: return cls.inline_call_(parent, func, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 3198, in inline_call_
[rank0]: tracer.run()
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 1052, in run
[rank0]: while self.step():
[rank0]: ^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 962, in step
[rank0]: self.dispatch_table[inst.opcode](self, inst)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 659, in wrapper
[rank0]: return inner_fn(self, inst)
[rank0]: ^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 1736, in CALL_FUNCTION_EX
[rank0]: self.call_function(fn, argsvars.items, kwargsvars)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 897, in call_function
[rank0]: self.push(fn.call_function(self, args, kwargs)) # type: ignore[arg-type]
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/functions.py", line 858, in call_function
[rank0]: return self.func.call_function(tx, merged_args, merged_kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/functions.py", line 317, in call_function
[rank0]: return super().call_function(tx, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/functions.py", line 118, in call_function
[rank0]: return tx.inline_user_function_return(self, [*self.self_args(), *args], kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 903, in inline_user_function_return
[rank0]: return InliningInstructionTranslator.inline_call(self, fn, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 3072, in inline_call
[rank0]: return cls.inline_call_(parent, func, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 3198, in inline_call_
[rank0]: tracer.run()
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 1052, in run
[rank0]: while self.step():
[rank0]: ^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 962, in step
[rank0]: self.dispatch_table[inst.opcode](self, inst)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 659, in wrapper
[rank0]: return inner_fn(self, inst)
[rank0]: ^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 2341, in CALL
[rank0]: self._call(inst)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 2335, in _call
[rank0]: self.call_function(fn, args, kwargs)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 897, in call_function
[rank0]: self.push(fn.call_function(self, args, kwargs)) # type: ignore[arg-type]
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/misc.py", line 1022, in call_function
[rank0]: return self.obj.call_method(tx, self.name, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/misc.py", line 778, in call_method
[rank0]: .call_function(tx, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/functions.py", line 317, in call_function
[rank0]: return super().call_function(tx, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/functions.py", line 118, in call_function
[rank0]: return tx.inline_user_function_return(self, [*self.self_args(), *args], kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 903, in inline_user_function_return
[rank0]: return InliningInstructionTranslator.inline_call(self, fn, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 3072, in inline_call
[rank0]: return cls.inline_call_(parent, func, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 3198, in inline_call_
[rank0]: tracer.run()
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 1052, in run
[rank0]: while self.step():
[rank0]: ^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 962, in step
[rank0]: self.dispatch_table[inst.opcode](self, inst)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 659, in wrapper
[rank0]: return inner_fn(self, inst)
[rank0]: ^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 2341, in CALL
[rank0]: self._call(inst)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 2335, in _call
[rank0]: self.call_function(fn, args, kwargs)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/symbolic_convert.py", line 897, in call_function
[rank0]: self.push(fn.call_function(self, args, kwargs)) # type: ignore[arg-type]
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/torch.py", line 953, in call_function
[rank0]: tensor_variable = wrap_fx_proxy(
[rank0]: ^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/builder.py", line 2153, in wrap_fx_proxy
[rank0]: return wrap_fx_proxy_cls(target_cls=TensorVariable, **kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/builder.py", line 2219, in wrap_fx_proxy_cls
[rank0]: return _wrap_fx_proxy(
[rank0]: ^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/variables/builder.py", line 2315, in _wrap_fx_proxy
[rank0]: example_value = get_fake_value(proxy.node, tx, allow_non_graph_fake=True)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/utils.py", line 2536, in get_fake_value
[rank0]: raise TorchRuntimeError(str(e)).with_traceback(e.__traceback__) from None
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/utils.py", line 2471, in get_fake_value
[rank0]: ret_val = wrap_fake_exception(
[rank0]: ^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/utils.py", line 2017, in wrap_fake_exception
[rank0]: return fn()
[rank0]: ^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/utils.py", line 2472, in <lambda>
[rank0]: lambda: run_node(tx.output, node, args, kwargs, nnmodule)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/utils.py", line 2604, in run_node
[rank0]: raise RuntimeError(make_error_message(e)).with_traceback(
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_dynamo/utils.py", line 2586, in run_node
[rank0]: return node.target(*args, **kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_prims_common/wrappers.py", line 289, in _fn
[rank0]: result = fn(*args, is_out=(out is not None), **kwargs) # type: ignore[arg-type]
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_decomp/decompositions.py", line 4444, in matmul
[rank0]: return torch.ops.aten._unsafe_view(t1_folded.mv(t2), output_shape)
[rank0]: ^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/utils/_stats.py", line 21, in wrapper
[rank0]: return fn(*args, **kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_subclasses/fake_tensor.py", line 1276, in __torch_dispatch__
[rank0]: return self.dispatch(func, types, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_subclasses/fake_tensor.py", line 1816, in dispatch
[rank0]: return self._cached_dispatch_impl(func, types, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_subclasses/fake_tensor.py", line 1377, in _cached_dispatch_impl
[rank0]: output = self._dispatch_impl(func, types, args, kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_subclasses/fake_tensor.py", line 2290, in _dispatch_impl
[rank0]: decomposition_table[func](*args, **kwargs)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_prims_common/wrappers.py", line 291, in _fn
[rank0]: result = fn(*args, **kwargs)
[rank0]: ^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_decomp/decompositions.py", line 83, in inner
[rank0]: r = f(*tree_map(increase_prec, args), **tree_map(increase_prec, kwargs))
[rank0]: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/_decomp/decompositions.py", line 4336, in mv
[rank0]: torch._check(
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/__init__.py", line 1656, in _check
[rank0]: _check_with(RuntimeError, cond, message)
[rank0]: File "/usr/local/lib/python3.11/dist-packages/torch/__init__.py", line 1638, in _check_with
[rank0]: raise error_type(message_evaluated)
[rank0]: torch._dynamo.exc.TorchRuntimeError: Failed running call_function <built-in method matmul of type object at 0x7f2e2a41ff00>(*(GradTrackingTensor(lvl=1, value=
[rank0]: FakeTensor(..., device='cuda:0', size=(1, s0, 896), dtype=torch.bfloat16,
[rank0]: requires_grad=True)
[rank0]: ), GradTrackingTensor(lvl=1, value=
[rank0]: FakeTensor(..., device='cuda:0', size=(0,), dtype=torch.bfloat16,
[rank0]: requires_grad=True)
[rank0]: )), **{}):
[rank0]: size mismatch, got input (s0x896), vec (0)
Does liger GRPO support multi-gpu training with deepspeed zero3?