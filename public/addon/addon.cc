#include <node.h>
#include <signal.h>

using namespace v8;

void SendSignal(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope scope(isolate);

	if (args.Length() < 2) {
		isolate->ThrowException(Exception::TypeError(
		String::NewFromUtf8(isolate, "Wrong number of arguments")));
		return;
	}

	if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
		isolate->ThrowException(Exception::TypeError(
		String::NewFromUtf8(isolate, "Wrong arguments")));
		return;
	}

	int pid = args[0]->NumberValue();
	int signal = args[1]->NumberValue();

	kill(pid, signal);

	// double value = args[0]->NumberValue() + args[1]->NumberValue();
	// Local<Number> num = Number::New(isolate, value);

	// args.GetReturnValue().Set(num);
}

void Init(Handle<Object> exports) {
	NODE_SET_METHOD(exports, "sendSignal", SendSignal);
}

NODE_MODULE(addon, Init)